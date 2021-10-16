import {Module} from "@nestjs/common";
import {AuthClientConfigurationService} from "./AuthClientConfigurationService";
import {AuthZClientService} from "./authz.service";
import configVariables from "./AuthClientConfigurationVariables";
import {ConfigModule} from "@nestjs/config";
import {AuthzClientProvider as AuthZClientProvider} from "./AuthzClientProvider";

@Module({
    imports: [ConfigModule.forFeature(configVariables)],
    providers: [
        AuthZClientProvider,
        AuthZClientService,
        AuthClientConfigurationService,
    ],
    exports: [AuthZClientService],
})
export class AuthzClientModule {}
