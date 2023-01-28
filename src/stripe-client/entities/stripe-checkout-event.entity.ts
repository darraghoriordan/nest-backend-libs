import {ApiProperty} from "@nestjs/swagger";
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

    @Column({nullable: true})
    userUuid?: string;

    @Column()
    stripeSessionId!: string;

    @Column()
    stripeObjectType!: string;

    @Column("jsonb", {name: "stripeObject", nullable: false})
    stripeData: any;
}
