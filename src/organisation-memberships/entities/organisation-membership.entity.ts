import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Type} from "class-transformer";

import {
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    RelationId,
    UpdateDateColumn,
} from "typeorm";
import {Invitation} from "../../invitations/entities/invitation.entity.js";
import {MembershipRole} from "../../organisation/entities/member-role.entity.js";
import {Organisation} from "../../organisation/entities/organisation.entity.js";
import {User} from "../../user/entities/user.entity.js";

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

    @ApiProperty()
    @Type(() => Organisation)
    @ManyToOne(() => Organisation, (org) => org.memberships, {
        eager: true,
        cascade: ["insert", "update"],
    })
    organisation!: Organisation;

    @Column()
    @ApiProperty()
    @RelationId((membership: OrganisationMembership) => membership.organisation)
    public organisationId!: number;

    @OneToMany(() => Invitation, (inv) => inv.organisationMembership, {
        eager: true,
        nullable: true,
        cascade: ["insert", "update"],
    })
    @JoinColumn()
    invitations?: Relation<Invitation>[];

    @ApiPropertyOptional({type: () => MembershipRole, isArray: true})
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    @OneToMany(() => MembershipRole, (role) => role.membership, {
        eager: true,
        cascade: ["insert", "update"],
        onDelete: "CASCADE",
        orphanedRowAction: "delete",
    })
    @Type(() => MembershipRole)
    roles?: MembershipRole[];

    @CreateDateColumn()
    @ApiProperty()
    createdDate!: Date;

    @UpdateDateColumn()
    @ApiProperty()
    updateDate!: Date;
}
