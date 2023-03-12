import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity.js";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Type} from "class-transformer";

import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Generated,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from "typeorm";

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
    @Type(() => OrganisationMembership)
    @OneToOne(() => OrganisationMembership)
    organisationMembership!: Relation<OrganisationMembership>;

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
