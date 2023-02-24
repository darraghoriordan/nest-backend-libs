import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class StripeCheckoutEvent {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id!: number;

    @CreateDateColumn()
    @ApiProperty()
    createdDate!: Date;

    @ApiPropertyOptional()
    @Column({nullable: true})
    clientReferenceId?: string;

    @ApiProperty()
    @Column()
    stripeSessionId!: string;

    @ApiProperty()
    @Column()
    stripeObjectType!: string;

    @ApiProperty({type: "object", additionalProperties: true})
    @Column("jsonb", {name: "stripeObject", nullable: false})
    stripeData: any;
}
