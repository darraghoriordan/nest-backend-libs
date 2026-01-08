import {HeaderAPIKeyStrategy} from "passport-headerapikey";
import {PassportStrategy} from "@nestjs/passport";
import {UserValidationService} from "../services/UserValidation.service.js";
import {Injectable} from "@nestjs/common";
import {User} from "../../user/entities/user.entity.js";

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
    constructor(private readonly userValidationService: UserValidationService) {
        super(
            {header: "Authorization", prefix: "Api-Key "},
            true,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            async (
                apiKey: string,
                done: (
                    error: Error | undefined,
                    user?: User,
                    info?: Record<string, unknown>
                ) => boolean
            ) => {
                await this.validate(apiKey, done);
            }
        );
    }

    async validate(
        apiKey: string,
        done: (
            error: Error | undefined,
            user?: User,
            info?: Record<string, unknown>
        ) => boolean
    ) {
        try {
            const foundUser =
                await this.userValidationService.findUserByApiKey(apiKey);

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!foundUser || foundUser === null) {
                done(new Error("Invalid API key"));
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            done(undefined, foundUser!);
        } catch (error) {
            done(error as Error);
        }
    }
}
