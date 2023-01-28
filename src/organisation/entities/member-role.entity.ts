import {ApiProperty} from "@nestjs/swagger";

import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    //   RelationId,
    UpdateDateColumn,
} from "typeorm";
import {OrganisationMembership} from "./organisation-membership.entity";

@Entity()
export class MembershipRole {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id!: number;

    @ManyToOne(() => OrganisationMembership, (membership) => membership.roles, {
        eager: true,
        cascade: true,
    })
    membership!: OrganisationMembership;

    // @Column()
    // @RelationId((mr: MembershipRole) => mr.membership)
    // public membershipId!: number;

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
