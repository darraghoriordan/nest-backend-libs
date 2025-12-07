import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Type} from "class-transformer";

import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Generated,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from "typeorm";
import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity.js";
import {OrganisationSubscriptionRecord} from "../../organisation-subscriptions/entities/organisation-subscription.entity.js";

@Entity()
export class Organisation {
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

    @OneToMany(() => OrganisationMembership, (om) => om.organisation, {
        cascade: ["insert", "update"],
    })
    @Type(() => OrganisationMembership)
    memberships?: Relation<OrganisationMembership>[];

    @ApiPropertyOptional({type: OrganisationSubscriptionRecord, isArray: true})
    @Type(() => OrganisationSubscriptionRecord)
    @OneToMany(
        () => OrganisationSubscriptionRecord,
        (osr) => osr.organisation,
        {
            cascade: ["insert", "update"],
        }
    )
    subscriptionRecords?: Relation<OrganisationSubscriptionRecord>[];

    @Column()
    @ApiProperty()
    name!: string;

    @CreateDateColumn()
    @ApiProperty()
    createdDate!: Date;

    @UpdateDateColumn()
    @ApiProperty()
    updateDate!: Date;

    @DeleteDateColumn()
    @ApiPropertyOptional()
    deletedDate?: Date;
}
