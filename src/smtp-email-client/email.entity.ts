import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Generated,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import {Exclude} from "class-transformer";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

@Entity()
export class Email {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id!: number;

    @ApiProperty()
    @Column()
    @Index()
    @Exclude()
    ownerId!: string;

    @ApiProperty()
    @Column()
    @Generated("uuid")
    uuid!: string;

    @Column()
    @ApiProperty({type: String})
    to!: string;

    @Column()
    @ApiProperty({type: String})
    bccTo!: string;

    @Column({nullable: true})
    @ApiPropertyOptional()
    textBody?: string;

    @Column({nullable: true})
    @ApiPropertyOptional()
    htmlBody?: string;

    @Column()
    @ApiProperty()
    subject!: string;

    @Column({nullable: true})
    @ApiPropertyOptional()
    sentDate?: Date;

    @ApiProperty()
    @CreateDateColumn()
    createdDate!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedDate!: Date;

    @DeleteDateColumn()
    @ApiPropertyOptional()
    deletedDate?: Date;
}
