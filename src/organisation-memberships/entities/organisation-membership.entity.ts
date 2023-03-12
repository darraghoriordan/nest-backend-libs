import {ApiProperty} from "@nestjs/swagger";
import {Type} from "class-transformer";

import {
    AfterInsert,
    AfterLoad,
    AfterUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Generated,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
} from "typeorm";
import {Invitation} from "../../invitations/entities/invitation.entity.js";
import {MembershipRole} from "../../organisation/entities/member-role.entity.js";
import {Organisation} from "../../organisation/entities/organisation.entity.js";
import {User} from "../../user-internal/entities/user.entity.js";

@Entity()
export class OrganisationMembership {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id!: number;

    @Column("uuid", {
        name: "uuid",
        default: () => "uuid_generate_v4()",
    })
    @Generated("uuid")
    @ApiProperty()
    @Index()
    public uuid!: string;

    @ManyToOne(() => User, (user) => user.memberships, {
        eager: true,
        cascade: ["insert", "update"],
    })
    user!: User;

    @Column()
    @ApiProperty()
    @RelationId((membership: OrganisationMembership) => membership.user)
    public userId!: number;

    @ManyToOne(() => Organisation, (org) => org.memberships, {
        eager: true,
        cascade: ["insert", "update"],
    })
    organisation!: Organisation;

    @Column()
    @ApiProperty()
    @RelationId((membership: OrganisationMembership) => membership.organisation)
    public organisationId!: number;

    @OneToOne(() => Invitation, (inv) => inv.organisationMembership, {
        eager: true,
        nullable: true,
        cascade: ["insert", "update"],
    })
    @JoinColumn()
    invitation?: Invitation;

    @Column()
    @ApiProperty()
    @RelationId((membership: OrganisationMembership) => membership.invitation)
    public invitationId!: number;

    @ApiProperty({type: () => MembershipRole, isArray: true})
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    @OneToMany(() => MembershipRole, (role) => role.membership, {
        eager: true,
        cascade: true,
    })
    @Type(() => MembershipRole)
    roles!: MembershipRole[];

    @CreateDateColumn()
    @ApiProperty()
    createdDate!: Date;

    @UpdateDateColumn()
    @ApiProperty()
    updateDate!: Date;

    @DeleteDateColumn()
    @ApiProperty()
    deletedDate!: Date;

    // eslint-disable-next-line @typescript-eslint/require-await
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    async nullChecks() {
        if (!this.roles) {
            this.roles = [];
        }
    }
}
