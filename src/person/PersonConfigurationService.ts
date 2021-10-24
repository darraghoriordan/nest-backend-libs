/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {IsDefined, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService";

@Injectable()
export class PersonConfigurationService extends ValidatedConfigurationService {
    constructor(private configService: ConfigService) {
        super();
    }

    @IsDefined()
    @IsString()
    get fakeSub(): string {
        return this.configService.get<string>("person.fakeSub")!;
    }

    @IsDefined()
    @IsString()
    get fakeFamilyName(): string {
        return this.configService.get<string>("person.fakeFamilyName")!;
    }
    @IsDefined()
    @IsString()
    get fakeGivenNAme(): string {
        return this.configService.get<string>("person.fakeGivenNAme")!;
    }
    @IsDefined()
    @IsString()
    get fakeName(): string {
        return this.configService.get<string>("person.fakeName")!;
    }
    @IsDefined()
    @IsString()
    get fakeEmail(): string {
        return this.configService.get<string>("person.fakeEmail")!;
    }
    @IsDefined()
    @IsString()
    get fakePicture(): string {
        return this.configService.get<string>("person.fakePicture")!;
    }
}
