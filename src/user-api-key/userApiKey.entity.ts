import {ApiProperty} from "@nestjs/swagger";
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Generated,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
    RelationId,
    UpdateDateColumn,
} from "typeorm";
import {User} from "../user-internal/entities/user.entity.js";

@Entity()
export class UserApiKey {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id!: number;

    @Column("uuid", {
        name: "uuid",
        default: () => "uuid_generate_v4()",
    })
    @Generated("uuid")
    @ApiProperty()
    @Index()
    public uuid!: string;

    @ApiProperty()
    apiKey!: string;

    @ApiProperty()
    description!: string;

    @ManyToOne(() => User)
    user!: Relation<User>;

    @ApiProperty()
    @RelationId((userApiKey: UserApiKey) => userApiKey.user)
    userId!: number;

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
