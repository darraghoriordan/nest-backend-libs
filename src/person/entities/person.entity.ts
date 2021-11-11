import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Exclude} from "class-transformer";
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
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import {Organisation} from "../../organisation/entities/organisation.entity";

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

    @Exclude()
    @ManyToMany(() => Organisation, (org) => org.members, {
        cascade: true,
        onDelete: "CASCADE",
    })
    memberOfOrganisations!: Organisation[];

    @Exclude()
    @OneToMany(() => Organisation, (org) => org.owner, {
        cascade: true,
    })
    ownerOfOrganisations!: Organisation[];

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
        if (!this.memberOfOrganisations) {
            this.memberOfOrganisations = [];
        }
        if (!this.ownerOfOrganisations) {
            this.ownerOfOrganisations = [];
        }
    }
}
