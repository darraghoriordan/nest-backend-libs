import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Exclude, Expose} from "class-transformer";
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

    @Exclude()
    @Column("jsonb", {name: "stripeObject", nullable: false})
    stripeData: any;

    // special case for returning the stripe data
    @ApiProperty({type: String, name: "stripeDataAsString"})
    @Expose({name: "stripeDataAsString"})
    getStripeDataAsJsonString(): string {
        return JSON.stringify(this.stripeData, undefined, 4);
    }
}
