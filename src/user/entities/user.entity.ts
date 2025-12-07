import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Type} from "class-transformer";
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Generated,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from "typeorm";
import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity.js";
import {UserApiKey} from "../../user-api-key/userApiKey.entity.js";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id!: number;

    @ApiProperty()
    @Column()
    email!: string;

    @Column("uuid", {
        name: "uuid",
        default: () => "uuid_generate_v4()",
    })
    @Generated("uuid")
    @ApiProperty()
    @Index()
    public uuid!: string;

    @ApiProperty()
    @Column({default: false})
    emailVerified!: boolean;

    @ApiProperty()
    @Column({default: false})
    blocked!: boolean;

    @ApiPropertyOptional()
    @Column({nullable: true})
    name?: string;

    @ApiPropertyOptional()
    @Column({nullable: true})
    familyName?: string;

    @ApiPropertyOptional()
    @Column({nullable: true})
    givenName?: string;

    @ApiPropertyOptional()
    @Column({nullable: true})
    picture?: string;

    @ApiPropertyOptional()
    @Column({nullable: true})
    @Index({unique: true})
    auth0UserId?: string;

    @ApiPropertyOptional()
    @Column({nullable: true})
    username?: string;

    @ApiPropertyOptional({type: () => OrganisationMembership, isArray: true})
    @Type(() => OrganisationMembership)
    @OneToMany(() => OrganisationMembership, (om) => om.user, {
        cascade: ["insert", "update"],
    })
    memberships?: Relation<OrganisationMembership>[];

    // We don't want to expose the api keys to the user
    // We don't want to load them unless explicitly
    @ApiPropertyOptional({type: () => UserApiKey, isArray: true})
    @Type(() => UserApiKey)
    @OneToMany(() => UserApiKey, (om) => om.user, {eager: false})
    apiKeys?: Relation<UserApiKey>[];

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
