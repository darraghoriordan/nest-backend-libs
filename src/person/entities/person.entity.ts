import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
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
import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity";

@Entity()
export class Person {
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

    @ApiProperty()
    @Column()
    picture!: string;

    @ApiProperty()
    @Column()
    @Index({unique: true})
    auth0UserId!: string;

    @ApiPropertyOptional()
    @Column({nullable: true})
    username?: string;

    @ApiProperty({type: () => OrganisationMembership, isArray: true})
    @OneToMany(() => OrganisationMembership, (om) => om.person, {
        cascade: ["insert", "update"],
    })
    memberships!: OrganisationMembership[];

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
    }
}
