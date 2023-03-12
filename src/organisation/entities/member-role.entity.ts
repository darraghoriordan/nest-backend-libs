import {ApiProperty} from "@nestjs/swagger";

import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
    RelationId,
    UpdateDateColumn,
} from "typeorm";
import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity.js";

@Entity()
export class MembershipRole {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id!: number;

    // we don't expose this because the roles are exposed on the membership
    @ManyToOne(() => OrganisationMembership, (membership) => membership.roles)
    membership!: Relation<OrganisationMembership>;

    @ApiProperty()
    @Column()
    @RelationId((mr: MembershipRole) => mr.membership)
    public membershipId!: number;

    @ApiProperty()
    @Column()
    name!: string;

    @CreateDateColumn()
    @ApiProperty()
    createdDate!: Date;

    @UpdateDateColumn()
    @ApiProperty()
    updateDate!: Date;

    @DeleteDateColumn()
    @ApiProperty()
    deletedDate!: Date;
}
