import {Injectable, Logger, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {IsNull, LessThan, Repository} from "typeorm";
import {Roles} from "../organisation/dto/RolesEnum";
import {CreateInvitationDto} from "./dto/create-invitation.dto";
import {Invitation} from "./entities/invitation.entity";
import {SmtpEmailClient} from "../smtp-email-client/email-client.service";
import {InvitationsConfigurationService} from "./InvitationConfigurationService";
import {RequestUser} from "../authz/RequestWithUser";
import {OrganisationMembership} from "../organisation-memberships/entities/organisation-membership.entity";
import {MembershipRole} from "../organisation/entities/member-role.entity";
import {User} from "../user-internal";

@Injectable()
export class InvitationService {
    private readonly logger = new Logger(InvitationService.name);
    constructor(
        @InjectRepository(Invitation)
        private invitationRepository: Repository<Invitation>,
        @InjectRepository(OrganisationMembership)
        private orgMembershipRepository: Repository<OrganisationMembership>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly emailClient: SmtpEmailClient,
        private readonly configService: InvitationsConfigurationService
    ) {}

    async getOneActiveInvitation(invitationCode: string) {
        return this.invitationRepository.findOne({
            where: {
                uuid: invitationCode,
                acceptedOn: IsNull(),
                expiresOn: LessThan(new Date()),
            },
            relations: {
                organisationMembership: {
                    user: true,
                    organisation: true,
                },
            },
        });
    }

    async acceptInvitation(invitationId: number): Promise<void> {
        await this.invitationRepository.manager.transaction(
            async (transactionalEntityManager) => {
                // get the invitation again to ensure we have the latest version
                const latestInvitation =
                    await transactionalEntityManager.findOne(Invitation, {
                        where: {id: invitationId},
                        relations: {
                            organisationMembership: true,
                        },
                    });

                if (!latestInvitation) {
                    throw new NotFoundException(
                        `Invitation with id ${invitationId} not found`
                    );
                }
                // set the invitation to accepted
                latestInvitation.acceptedOn = new Date();
                await transactionalEntityManager.save(latestInvitation);

                // set the user's membership to member and remove the invitation role
                const memberRole = new MembershipRole();
                memberRole.name = Roles.member;
                latestInvitation.organisationMembership.roles = [memberRole];

                await transactionalEntityManager.save(
                    latestInvitation.organisationMembership
                );
            }
        );
    }

    async create(
        createDto: CreateInvitationDto,
        createdBy: RequestUser
    ): Promise<Invitation> {
        await this.canManageInvitationsForThisOrg(
            createDto.organisationId,
            createdBy.id
        );

        const existingMemberships = await this.orgMembershipRepository.find({
            where: {
                user: {
                    email: createDto.emailAddress,
                },
                organisation: {
                    id: createDto.organisationId,
                },
            },
            relations: {
                invitation: true,
                roles: true,
            },
        });

        if (
            existingMemberships.some((m) =>
                m.roles.some(
                    (r) => r.name === Roles.member || r.name === Roles.owner
                )
            )
        ) {
            const message =
                "A user with this email address is already a member of this organisation";
            this.logger.error(message, {createDto, createdBy});
            throw new Error(message);
        }

        if (
            existingMemberships.some(
                (m) =>
                    m.invitation &&
                    m.invitation.acceptedOn === null &&
                    m.invitation.expiresOn > new Date()
            )
        ) {
            const message =
                "An valid invitation with this email already exists for this organisation";
            this.logger.error(message, {createDto, createdBy});
            throw new Error(message);
        }

        // new empty user
        const user = new User();
        user.email = createDto.emailAddress;
        const savedUser = await this.userRepository.save(user);
        // new role
        const role = new MembershipRole();
        role.name = Roles.invited;

        // a new invitation
        const unsavedInvitation = new Invitation();
        unsavedInvitation.emailAddress = createDto.emailAddress;
        unsavedInvitation.expiresOn = new Date();
        unsavedInvitation.expiresOn.setDate(
            unsavedInvitation.expiresOn.getDate() + 1
        );

        unsavedInvitation.givenName = createDto.givenName;

        // create a new membership
        const membership = this.orgMembershipRepository.create();
        membership.organisationId = createDto.organisationId;
        membership.userId = savedUser.id;
        membership.invitation = unsavedInvitation;
        membership.roles = [role];

        const savedMembership = await this.orgMembershipRepository.save(
            membership
        );
        const retrievedMembership = await this.orgMembershipRepository.findOne({
            where: {id: savedMembership.id},
            relations: {
                invitation: true,
                organisation: true,
            },
        });
        if (!retrievedMembership || !retrievedMembership.invitation) {
            this.logger.error("Newly saved membership not found", {
                createDto,
                createdBy,
                createdMembershipId: savedMembership?.id,
            });
            throw new Error("Newly saved membership not found");
        }

        // try to email the invitation
        await this.emailClient.sendMail(
            [unsavedInvitation.emailAddress],
            [],
            `Invitation to join ${retrievedMembership.organisation.name}`,
            createdBy.uuid,
            `You have been invited to join ${
                retrievedMembership.organisation.name
            } by ${
                createdBy.givenName || "another member"
            }. Please click the link below to accept the invitation.

            ${this.configService.baseUrl}/accept-invitation/${
                retrievedMembership.invitation.uuid
            }`
        );

        // if it gets to here we have a queued invitation
        retrievedMembership.invitation.notificationSent = new Date();

        return this.invitationRepository.save(retrievedMembership.invitation);
    }

    private async canManageInvitationsForThisOrg(
        orgId: number,
        userId: number
    ) {
        const requesterMembership =
            await this.orgMembershipRepository.findOneOrFail({
                where: {
                    organisation: {
                        id: orgId,
                    },
                    user: {
                        id: userId,
                    },
                },
                relations: {
                    roles: true,
                },
            });
        if (
            requesterMembership.roles.some((role) => role.name === Roles.owner)
        ) {
            throw new Error(
                "You must be an admin to invite users to an organisation"
            );
        }
    }

    async remove(uuid: string, currentUserId: number): Promise<Invitation> {
        const invitation = await this.invitationRepository.findOneOrFail({
            where: {
                uuid,
            },
            relations: {
                organisationMembership: {organisation: true},
            },
        });

        if (!invitation) {
            throw new NotFoundException();
        }
        await this.canManageInvitationsForThisOrg(
            invitation.organisationMembership.organisation.id,
            currentUserId
        );
        return this.invitationRepository.remove(invitation);
    }
}
