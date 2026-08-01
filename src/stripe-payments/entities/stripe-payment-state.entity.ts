import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("stripe_payment_state")
@Index(["paymentSystemTransactionId"], {unique: true})
export class StripePaymentState {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({length: 255})
    paymentSystemTransactionId!: string;

    @Column({length: 255})
    lastStripeEventId!: string;

    @Column({type: "timestamptz"})
    lastStripeEventCreatedAt!: Date;

    @Column({length: 64})
    status!: string;

    @CreateDateColumn()
    createdDate!: Date;

    @UpdateDateColumn()
    updatedDate!: Date;
}
