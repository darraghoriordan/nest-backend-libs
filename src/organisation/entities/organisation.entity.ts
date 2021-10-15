import {ApiProperty} from "@nestjs/swagger";
import {Exclude} from "class-transformer";
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
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
}
