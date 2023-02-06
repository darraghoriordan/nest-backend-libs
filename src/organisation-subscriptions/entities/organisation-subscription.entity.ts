import {ApiProperty} from "@nestjs/swagger";
import {Type} from "class-transformer";

import {
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
} from "typeorm";
import {Organisation} from "../../organisation/entities/organisation.entity";

@Entity()
export class OrganisationSubscriptionRecord {
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

    @Column()
    @ApiProperty()
    stripeSubscriptionId!: string;

    @Column()
    @ApiProperty()
    stripeCustomerId!: string;

    @Column()
    @ApiProperty()
    stripePriceId!: string;

    @Column()
    @ApiProperty()
    @Type(() => Date)
    validUntil!: Date;

    @ManyToOne(() => Organisation, (org) => org.subscriptionRecords, {})
    organisation!: Organisation;

    @Column()
    @RelationId((sub: OrganisationSubscriptionRecord) => sub.organisation)
    public organisationId!: number;

    @CreateDateColumn()
    @ApiProperty()
    createdDate!: Date;
}
