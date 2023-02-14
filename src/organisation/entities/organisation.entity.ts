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
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity";
import {OrganisationSubscriptionRecord} from "../../organisation-subscriptions/entities/organisation-subscription.entity";

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
    memberships!: OrganisationMembership[];

    @OneToMany(
        () => OrganisationSubscriptionRecord,
        (osr) => osr.organisation,
        {
            cascade: ["insert", "update"],
        }
    )
    @Type(() => OrganisationSubscriptionRecord)
    subscriptionRecords!: OrganisationSubscriptionRecord[];

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
    @ApiProperty()
    deletedDate!: Date;

    // eslint-disable-next-line @typescript-eslint/require-await
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    async nullChecks() {
        if (!this.memberships) {
            this.memberships = [];
        }
    }
}
