import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("stripe_checkout_attempt")
@Index(["idempotencyKey"], {unique: true})
@Index(["stripeSessionId"], {unique: true})
export class StripeCheckoutAttempt {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id!: number;

    @Column({length: 255})
    idempotencyKey!: string;

    @Column({length: 64})
    organisationUuid!: string;

    @Column({length: 64})
    userUuid!: string;

    @Column({length: 64})
    productKey!: string;

    @Column({length: 255})
    priceId!: string;

    @Column({length: 32})
    mode!: string;

    @Column({length: 32, default: "creating"})
    status!: "creating" | "created" | "failed";

    @Column({nullable: true, length: 255})
    @ApiPropertyOptional()
    stripeSessionId?: string;

    @Column({nullable: true, type: "text"})
    @ApiPropertyOptional()
    stripeSessionUrl?: string;

    @Column({nullable: true, type: "text"})
    errorMessage?: string;

    @CreateDateColumn()
    createdDate!: Date;

    @UpdateDateColumn()
    updatedDate!: Date;
}
