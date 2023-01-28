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
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
//import {Invitation} from "../../invitations/entities/invitation.entity";
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
        cascade: ["insert", "update"],
    })
    memberships!: OrganisationMembership[];

    // @OneToMany(() => Invitation, (om) => om.organisation, {
    //     eager: true,
    //     cascade: ["insert", "update"],
    // })
    // @Index()
    // invitations!: Invitation[];

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
