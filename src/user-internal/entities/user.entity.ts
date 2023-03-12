import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Type} from "class-transformer";
import {
    AfterInsert,
    AfterLoad,
    AfterUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Generated,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
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

    @ApiProperty({type: () => OrganisationMembership, isArray: true})
    @Type(() => OrganisationMembership)
    @OneToMany(() => OrganisationMembership, (om) => om.user, {
        cascade: ["insert", "update"],
    })
    memberships!: OrganisationMembership[];

    @ApiProperty({type: () => UserApiKey, isArray: true})
    @Type(() => UserApiKey)
    @OneToMany(() => UserApiKey, (om) => om.user, {})
    apiKeys!: UserApiKey[];

    @CreateDateColumn()
    @ApiProperty()
    createdDate!: Date;

    @UpdateDateColumn()
    @ApiProperty()
    updateDate!: Date;

    @DeleteDateColumn()
    @ApiProperty()
    deletedDate!: Date;

    // eslint-disable-next-line @typescript-eslint/require-await
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    async nullChecks() {
        if (!this.memberships) {
            this.memberships = [];
        }
        if (!this.apiKeys) {
            this.apiKeys = [];
        }
    }
}
