import {Injectable} from "@nestjs/common";
import {EntityManager} from "typeorm";

/**
 * This service supports integration testing. It allows
 * some of the database data to be cleaned up by the
 * power user.
 *
 * If you create additional models that have foreign key
 * relationships to the models in this service, you will
 * need to clean up those models as well, before running this
 * or these will fail.
 */
@Injectable()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class SuperPowersService {
    constructor(private readonly entityManager: EntityManager) {}

    async resetDatabase() {
        await this.entityManager.query(
            ` -- orgs
            TRUNCATE TABLE "membership_role", "organisation_membership","organisation_subscription_record","organisation" RESTART IDENTITY CASCADE;

            -- users
            TRUNCATE TABLE "user_api_key", "email", "user", RESTART IDENTITY CASCADE;

            -- payments
            TRUNCATE TABLE "payment_session_reference", "stripe_checkout_event" RESTART IDENTITY CASCADE;`
        );
        return true;
    }
}
