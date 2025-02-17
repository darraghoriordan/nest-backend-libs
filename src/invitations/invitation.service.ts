import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {IsNull, MoreThan, Repository} from "typeorm";
import {Roles} from "../organisation/dto/RolesEnum.js";
import {CreateInvitationDto} from "./dto/create-invitation.dto.js";
import {Invitation} from "./entities/invitation.entity.js";
import {SmtpEmailClient} from "../smtp-email-client/email-client.service.js";
import {InvitationsConfigurationService} from "./InvitationConfigurationService.js";
import {RequestUser} from "../authorization/models/RequestWithUser.js";
import {OrganisationMembership} from "../organisation-memberships/entities/organisation-membership.entity.js";
import {MembershipRole} from "../organisation/entities/member-role.entity.js";
import {User} from "../user/entities/user.entity.js";

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
                expiresOn: MoreThan(new Date()),
            },
            relations: {
                organisationMembership: {
                    user: true,
                    organisation: true,
                },
            },
        });
    }

    async getAllForOrg(
        orgId: string,
        requestUser: RequestUser
    ): Promise<Invitation[]> {
        await this.canManageInvitationsForThisOrg({
            orgUuid: orgId,
            user: requestUser,
        });
        return this.invitationRepository.find({
            where: {
                organisationMembership: {
                    organisation: {
                        uuid: orgId,
                    },
                },
            },
        });
    }

    async create(
        createDto: CreateInvitationDto,
        createdBy: RequestUser
    ): Promise<Invitation> {
        await this.canManageInvitationsForThisOrg({
            orgId: createDto.organisationId,
            user: createdBy,
        });

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
                invitations: true,
                roles: true,
            },
        });

        if (
            existingMemberships.some((m) =>
                m.roles?.some(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
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
            existingMemberships.some((m) =>
                m.invitations?.some(
                    (mi) => mi.acceptedOn === null && mi.expiresOn > new Date()
                )
            )
        ) {
            const message =
                "An valid invitation with this email already exists for this organisation";
            this.logger.error(message, {createDto, createdBy});
            throw new BadRequestException(message);
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
        const membership = this.orgMembershipRepository.create({
            invitations: [],
        });
        membership.organisationId = createDto.organisationId;
        membership.userId = savedUser.id;
        membership.invitations?.push(unsavedInvitation);
        membership.roles = [role];

        const savedMembership =
            await this.orgMembershipRepository.save(membership);
        const retrievedMembership = await this.orgMembershipRepository.findOne({
            where: {id: savedMembership.id},
            relations: {
                invitations: true,
                organisation: true,
            },
        });

        if (!retrievedMembership) {
            this.logger.error("New membership did not save correctly", {
                createDto,
                createdBy,
                createdMembershipId: savedMembership?.id,
            });
            throw new Error("New membership did not save correctly");
        }

        const validInvitation = retrievedMembership.invitations?.find(
            (invitation) =>
                invitation.expiresOn > new Date() && !invitation.acceptedOn
        );

        if (!validInvitation) {
            this.logger.error("New invitation did not save correctly", {
                createDto,
                createdBy,
                createdMembershipId: savedMembership?.id,
            });
            throw new Error("New invitation did not save correctly");
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
                validInvitation.uuid
            }`
        );

        // if it gets to here we have a queued invitation
        validInvitation.notificationSent = new Date();

        const savedInvitation =
            await this.invitationRepository.save(validInvitation);
        // we need to return the membership with the invitation
        // torm doesn't like if we just assign and return so get it again
        const fullInvitation = await this.invitationRepository.findOne({
            where: {
                id: savedInvitation.id,
            },
            relations: {
                organisationMembership: {
                    user: true,
                    roles: true,
                },
            },
        });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return fullInvitation!;
    }

    private async canManageInvitationsForThisOrg(parameters: {
        orgId?: number;
        orgUuid?: string;
        user: RequestUser;
    }): Promise<void> {
        const {orgId, orgUuid, user} = parameters;
        if (orgId === undefined && orgUuid === undefined) {
            throw new BadRequestException(
                "Either orgId or orgUuid must be provided"
            );
        }

        // super admin can do anything
        if (user.permissions.includes("modify:all")) {
            return;
        }

        const requesterMembership =
            await this.orgMembershipRepository.findOneOrFail({
                where: {
                    organisation: {
                        id: orgId,
                        uuid: orgUuid,
                    },
                    user: {
                        id: user.id,
                    },
                },
                relations: {
                    roles: true,
                },
            });
        if (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
            requesterMembership.roles?.some((role) => role.name === Roles.owner)
        ) {
            return;
        }

        throw new ForbiddenException(
            "You don't have permission to work with invitations"
        );
    }

    async remove(uuid: string, currentUser: RequestUser): Promise<Invitation> {
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
        await this.canManageInvitationsForThisOrg({
            orgId: invitation.organisationMembership.organisation.id,
            user: currentUser,
        });
        return this.invitationRepository.softRemove(invitation);
    }
}
