import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity.js";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Type} from "class-transformer";

import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Generated,
    ManyToOne,
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

    @Column({nullable: true})
    @ApiPropertyOptional()
    notificationSent?: Date;

    @Column()
    @ApiProperty()
    expiresOn!: Date;

    @Column({nullable: true})
    @ApiPropertyOptional()
    acceptedOn?: Date;

    @ApiProperty({type: () => OrganisationMembership})
    @Type(() => OrganisationMembership)
    @ManyToOne(() => OrganisationMembership, (om) => om.invitations, {
        cascade: ["insert", "update"],
    })
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
