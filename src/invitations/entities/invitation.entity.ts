import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Generated,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import {Organisation} from "../../organisation/entities/organisation.entity";

@Entity()
export class Invitation {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id!: number;

    @Column("uuid", {
        name: "uuid",
        default: () => "uuid_generate_v4()",
    })
    @Generated("uuid")
    @ApiProperty()
    public uuid!: string;

    @Column()
    @ApiProperty()
    givenName!: string;

    @Column()
    @ApiProperty()
    emailAddress!: string;

    @Column()
    @ApiProperty()
    notificationSent!: Date;

    @Column()
    @ApiProperty()
    expiresOn!: Date;

    @Column()
    @ApiPropertyOptional()
    acceptedOn?: Date;

    @ApiProperty()
    @ManyToOne(() => Organisation, {
        eager: true,
    })
    organisation!: Organisation;

    @CreateDateColumn()
    @ApiProperty()
    createdDate!: Date;

    @UpdateDateColumn()
    @ApiProperty()
    updateDate!: Date;

    @DeleteDateColumn()
    @ApiPropertyOptional()
    deletedDate?: Date;
}
