import {ApiProperty} from "@nestjs/swagger";
import {Type} from "class-transformer";

import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Generated,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
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
    productDisplayName!: string;

    @Column()
    @ApiProperty()
    paymentSystemTransactionId!: string;

    @Column()
    @ApiProperty()
    paymentSystemProductId!: string;

    @Column()
    @ApiProperty()
    paymentSystemCustomerId!: string;

    @Column()
    @ApiProperty()
    paymentSystemCustomerEmail!: string;

    @Column()
    @ApiProperty()
    paymentSystemMode!: string;

    @Column()
    @ApiProperty()
    paymentSystemName!: string;

    @Column()
    @ApiProperty()
    @Type(() => Date)
    validUntil!: Date;

    @ManyToOne(() => Organisation, (org) => org.subscriptionRecords, {})
    organisation!: Organisation;

    @ApiProperty()
    @Column()
    @RelationId((sub: OrganisationSubscriptionRecord) => sub.organisation)
    public organisationId!: number;

    @CreateDateColumn()
    @ApiProperty()
    createdDate!: Date;

    @UpdateDateColumn()
    @ApiProperty()
    updatedDate!: Date;

    @DeleteDateColumn()
    @ApiProperty()
    deletedDate!: Date;
}
