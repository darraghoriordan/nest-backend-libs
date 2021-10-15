/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {IsBoolean, IsDefined, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService";

@Injectable()
export class EmailConfigurationService extends ValidatedConfigurationService {
    constructor(private configService: ConfigService) {
        super();
    }

    @IsDefined()
    @IsBoolean()
    get isEmailSyncSendEnabled(): boolean {
        return (
            this.configService.get<string>("email.isEmailSyncSendEnabled") ===
            "true"
        );
    }

    @IsDefined()
    @IsString()
    get emailBcc(): string {
        return this.configService.get<string>("email.emailBcc")!;
    }

    @IsDefined()
    @IsString()
    get emailPassword(): string {
        return this.configService.get<string>("email.emailPassword")!;
    }

    @IsDefined()
    @IsString()
    get emailUsername(): string {
        return this.configService.get<string>("email.emailUsername")!;
    }

    @IsDefined()
    @IsString()
    get senderEmailAddress(): string {
        return this.configService.get<string>("email.senderEmailAddress")!;
    }
}
