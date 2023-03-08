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
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
} from "typeorm";
import {MembershipRole} from "../../organisation/entities/member-role.entity";
import {Organisation} from "../../organisation/entities/organisation.entity";
import {User} from "../../user-internal/entities/user.entity";

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
