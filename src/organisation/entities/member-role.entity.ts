import {ApiProperty} from "@nestjs/swagger";

import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
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
    @Index()
    @JoinColumn()
    membership!: OrganisationMembership;

    @Column()
    @RelationId((membership: MembershipRole) => membership.membership)
    public membershipId!: number;

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
