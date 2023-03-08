import {ApiProperty} from "@nestjs/swagger";
import {
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    Index,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class PaymentSessionReference {
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

    @CreateDateColumn()
    @ApiProperty()
    createdDate!: Date;

    @Column({nullable: true})
    organisationUuid?: string;

    @Column()
    userUuid!: string;
}
