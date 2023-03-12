import {HeaderAPIKeyStrategy} from "passport-headerapikey";
import {PassportStrategy} from "@nestjs/passport";
import {UserValidationService} from "../services/UserValidation.service.js";
import {Injectable} from "@nestjs/common";
import {User} from "../../user-internal/entities/user.entity.js";

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
    constructor(private readonly userValidationService: UserValidationService) {
        super(
            {header: "Authorization", prefix: "Api-Key "},
            true,
            async (
                apiKey: string,
                done: (
                    error: Error | undefined,
                    user?: User,
                    info?: {[key: string]: any}
                ) => boolean
            ) => {
                return await this.validate(apiKey, done);
            }
        );
    }

    async validate(
        apiKey: string,
        done: (
            error: Error | undefined,
            user?: User,
            info?: {[key: string]: any}
        ) => boolean
    ) {
        try {
            const foundUser =
                await this.userValidationService.validateUserApiKey(apiKey);

            if (!foundUser) {
                done(new Error("Invalid API key"));
            }

            done(undefined, foundUser);
        } catch (error) {
            done(error as Error);
        }
    }
}
