import {Module} from "@nestjs/common";
import {AuthClientConfigurationService} from "./AuthClientConfigurationService.js";
import {AuthZClientService} from "./authz.service.js";
import configVariables from "./AuthClientConfigurationVariables.js";
import {ConfigModule} from "@nestjs/config";
import {AuthzClientProvider as AuthZClientProvider} from "./AuthzClientProvider.js";
import {AuthzUserInfoProvider} from "./AuthzUserInfoProvider.js";

@Module({
    imports: [ConfigModule.forFeature(configVariables)],
    providers: [
        AuthClientConfigurationService,
        AuthZClientProvider,
        AuthZClientService,
        AuthzUserInfoProvider,
    ],
    exports: [AuthZClientService],
})
export class AuthzClientModule {}
