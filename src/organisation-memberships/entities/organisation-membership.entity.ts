import {ApiProperty} from "@nestjs/swagger";

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
import {Person} from "../../person/entities/person.entity";

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

    @ManyToOne(() => Person, (person) => person.memberships, {
        eager: true,
        cascade: ["insert", "update"],
    })
    person!: Person;

    @Column()
    @RelationId((membership: OrganisationMembership) => membership.person)
    public personId!: number;

    @ManyToOne(() => Organisation, (org) => org.memberships, {
        eager: true,
        cascade: ["insert", "update"],
    })
    organisation!: Organisation;

    @Column()
    @RelationId((membership: OrganisationMembership) => membership.organisation)
    public organisationId!: number;

    @ApiProperty({type: () => MembershipRole, isArray: true})
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    @OneToMany(() => MembershipRole, (role) => role.membership, {
        eager: true,
        cascade: true,
    })
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
