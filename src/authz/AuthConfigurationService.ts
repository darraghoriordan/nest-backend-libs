/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {IsDefined, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService";

@Injectable()
export class AuthConfigurationService extends ValidatedConfigurationService {
    constructor(private configService: ConfigService) {
        super();
    }

    @IsDefined()
    @IsString()
    get auth0Audience(): string {
        return this.configService.get<string>("auth.auth0audience")!;
    }

    @IsDefined()
    @IsString()
    get auth0Domain(): string {
        return this.configService.get<string>("auth.auth0Domain")!;
    }
}
