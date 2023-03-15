import {DisabledSuperPowersService} from "./disabled-super-powers.service.js";
import {SuperPowersService} from "./super-powers.service.js";

// not going to use config service just for this
// should consider changing some of these to
// dynamic modules to enable testing
export const SpServiceProvider = {
    provide: SuperPowersService,
    useClass:
        process.env.ENABLE_SUPER_POWERS === "true"
            ? SuperPowersService
            : DisabledSuperPowersService,
};
