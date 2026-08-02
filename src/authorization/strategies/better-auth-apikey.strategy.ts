import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {HeaderAPIKeyStrategy} from "passport-headerapikey";
import type {User} from "../../user/entities/user.entity.js";
import {BetterAuthUserValidationService} from "../services/BetterAuthUserValidation.service.js";

@Injectable()
export class BetterAuthApiKeyStrategy extends PassportStrategy(
    HeaderAPIKeyStrategy
) {
    constructor(
        private readonly userValidationService: BetterAuthUserValidationService
    ) {
        super(
            {header: "Authorization", prefix: "Api-Key "},
            true,
            // passport-headerapikey's callback overload is missing from its types.
            // @ts-expect-error -- callback mode is supported by the runtime strategy.
            async (
                apiKey: string,
                done: (error?: Error, user?: User) => void
            ) => {
                await this.validate(apiKey, done);
            }
        );
    }

    async validate(
        apiKey: string,
        done: (error?: Error, user?: User) => void
    ): Promise<void> {
        try {
            const user =
                await this.userValidationService.findUserByApiKey(apiKey);
            if (!user) {
                done(new Error("Invalid API key"));
                return;
            }
            done(undefined, user);
        } catch (error) {
            done(error as Error);
        }
    }
}
