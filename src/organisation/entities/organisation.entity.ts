import {ApiProperty} from "@nestjs/swagger";
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
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
} from "typeorm";
import {Person} from "../../person/entities/person.entity";

@Entity()
export class Organisation {
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

    @ManyToMany(() => Person, (orgMember) => orgMember.memberOfOrganisations, {
        eager: true,
        onDelete: "CASCADE",
    })
    @Exclude()
    @JoinTable()
    members!: Person[];

    @ManyToOne(() => Person, (person) => person.ownerOfOrganisations, {
        eager: true,
        onDelete: "CASCADE",
    })
    @Index()
    @JoinColumn()
    owner!: Person;

    @RelationId((organisation: Organisation) => organisation.owner)
    @ApiProperty()
    ownerId!: number;

    @Column()
    @ApiProperty()
    name!: string;

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
        if (!this.members) {
            this.members = [];
        }
    }
}
