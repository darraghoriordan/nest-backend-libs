import {ApiExtraModels, ApiProperty} from "@nestjs/swagger";

import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
    RelationId,
    UpdateDateColumn,
} from "typeorm";
import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity.js";
import {Roles} from "../dto/RolesEnum.js";

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
    @ApiExtraModels(() => Roles)
    name!: string;

    @CreateDateColumn()
    @ApiProperty()
    createdDate!: Date;

    @UpdateDateColumn()
    @ApiProperty()
    updateDate!: Date;
}
