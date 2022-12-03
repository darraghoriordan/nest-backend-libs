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
    @Column({nullable: false})
    @Index()
    @Exclude()
    ownerId!: string;

    @ApiProperty()
    @Column({nullable: false})
    @Generated("uuid")
    uuid!: string;

    @Column()
    @ApiProperty({type: String})
    to!: string;

    @Column()
    @ApiProperty()
    body!: string;

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

    @ApiProperty()
    @DeleteDateColumn()
    deletedDate!: Date;
}
