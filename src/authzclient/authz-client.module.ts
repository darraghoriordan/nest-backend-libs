import {Module} from "@nestjs/common";
import {AuthClientConfigurationService} from "./AuthClientConfigurationService.js";
import {AuthZClientService} from "./authz.service.js";
import configVariables from "./AuthClientConfigurationVariables.js";
import {ConfigModule} from "@nestjs/config";
import {AuthzClientProvider as AuthZClientProvider} from "./AuthzClientProvider.js";

@Module({
    imports: [ConfigModule.forFeature(configVariables)],
    providers: [
        AuthClientConfigurationService,
        AuthZClientProvider,
        AuthZClientService,
    ],
    exports: [AuthZClientService],
})
export class AuthzClientModule {}
