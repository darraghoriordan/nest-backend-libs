import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("stripe_payment_event")
@Index(["stripeEventId"], {unique: true})
@Index(["stripeObjectId", "eventType"])
@Index(["status", "processingStartedAt"])
export class StripeCheckoutEvent {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id!: number;

    @Column({length: 255})
    @ApiProperty()
    stripeEventId!: string;

    @Column({length: 255})
    @ApiProperty()
    stripeObjectId!: string;

    @Column({length: 128})
    @ApiProperty()
    eventType!: string;

    @Column({nullable: true, length: 255})
    @ApiPropertyOptional()
    clientReferenceId?: string;

    @Column({length: 32, default: "received"})
    @ApiProperty()
    status!: "received" | "processing" | "processed" | "failed";

    @Column({type: "jsonb"})
    stripeData!: unknown;

    @Column({nullable: true, type: "text"})
    errorMessage?: string;

    @Column({nullable: true, type: "timestamptz"})
    processingStartedAt?: Date;

    @Column({nullable: true, type: "timestamptz"})
    processedAt?: Date;

    @Column({default: 0})
    processingAttempts!: number;

    @CreateDateColumn()
    @ApiProperty({format: "date-time"})
    createdDate!: Date;

    @UpdateDateColumn()
    updatedDate!: Date;

    @ApiProperty({type: String, name: "stripeDataAsString"})
    get stripeDataAsString(): string {
        return JSON.stringify(this.stripeData, undefined, 4);
    }
}
