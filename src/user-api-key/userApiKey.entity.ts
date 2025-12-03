import {ApiProperty} from "@nestjs/swagger";
import {
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
    RelationId,
    UpdateDateColumn,
} from "typeorm";
import {User} from "../user/entities/user.entity.js";

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
    @Column({unique: true})
    apiKey!: string;

    @ApiProperty()
    @Column()
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
}
