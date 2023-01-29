import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Roles} from "../organisation/dto/RolesEnum";
import {CreateInvitationDto} from "./dto/create-invitation.dto";
import {Invitation} from "./entities/invitation.entity";
import {SmtpEmailClient} from "../smtp-email-client/email-client.service";
import {Organisation} from "../organisation/entities/organisation.entity";
import {InvitationsConfigurationService} from "./InvitationConfigurationService";
import {RequestPerson} from "../authz/RequestWithUser";

@Injectable()
export class InvitationService {
    constructor(
        @InjectRepository(Invitation)
        private invitationRepository: Repository<Invitation>,
        @InjectRepository(Organisation)
        private organisationRepository: Repository<Organisation>,
        private readonly emailClient: SmtpEmailClient,
        private readonly configService: InvitationsConfigurationService
    ) {}

    async create(
        createDto: CreateInvitationDto,
        createdBy: RequestPerson
    ): Promise<Invitation> {
        const existingInvitations = await this.invitationRepository.find({
            where: {
                emailAddress: createDto.emailAddress,
                organisation: {
                    id: createDto.organisationId,
                },
            },
        });

        const hasUnexpiredInvitations = existingInvitations.some(
            (invitation) => invitation.expiresOn > new Date()
        );
        if (hasUnexpiredInvitations) {
            throw new Error(
                "An valid invitation already exists for this email address for this organisation"
            );
        }

        // otherwise, create a new invitation
        const unsavedInvitation = new Invitation();
        unsavedInvitation.emailAddress = createDto.emailAddress;
        unsavedInvitation.expiresOn = new Date();
        unsavedInvitation.expiresOn.setDate(
            unsavedInvitation.expiresOn.getDate() + 1
        );
        unsavedInvitation.organisation =
            await this.organisationRepository.findOneOrFail({
                where: {id: createDto.organisationId},
            });
        unsavedInvitation.givenName = createDto.givenName;

        const savedInvitation = await this.invitationRepository.save(
            unsavedInvitation
        );

        // try to email the invitation
        await this.emailClient.sendMail(
            [unsavedInvitation.emailAddress],
            [],
            `Invitation to join ${unsavedInvitation.organisation.name}`,
            createdBy.uuid,
            `You have been invited to join ${
                unsavedInvitation.organisation.name
            } by ${createdBy.givenName || "another "} ${
                createdBy.familyName || "member"
            }. Please click the link below to accept the invitation.

            ${this.configService.baseUrl}/accept-invitation/${
                savedInvitation.uuid
            }`
        );

        // if it gets to here we have a sent invitation
        savedInvitation.notificationSent = new Date();

        return this.invitationRepository.save(savedInvitation);
    }

    async remove(uuid: string, currentUserId: number): Promise<Invitation> {
        const invitation = await this.invitationRepository.findOneOrFail({
            where: {
                uuid,
                organisation: {
                    memberships: {
                        person: {
                            id: currentUserId,
                        },
                        roles: {
                            name: Roles.owner,
                        },
                    },
                },
            },
        });

        return this.invitationRepository.remove(invitation);
    }
}
