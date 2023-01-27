import {ApiProperty} from "@nestjs/swagger";

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
import {OrganisationMembership} from "./organisation-membership.entity";

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

    @OneToMany(() => OrganisationMembership, (om) => om.organisation, {
        eager: true,
        cascade: ["insert", "update"],
    })
    @Index()
    memberships!: OrganisationMembership[];

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
        if (!this.memberships) {
            this.memberships = [];
        }
    }
}
