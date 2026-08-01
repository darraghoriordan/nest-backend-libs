/* eslint-disable @typescript-eslint/no-deprecated */
import type {ModuleMetadata} from "@nestjs/common";

export const STRIPE_MODULE_OPTIONS = Symbol("STRIPE_MODULE_OPTIONS");

/** @deprecated Use StripePaymentsModuleOptions. */
export interface StripeModuleOptions {
    accessToken: string;
    webhookVerificationKey: string;
    stripeRedirectsBaseUrl: string;
}

/** @deprecated Use StripePaymentsModuleAsyncOptions. */
export interface StripeModuleAsyncOptions extends Pick<
    ModuleMetadata,
    "imports"
> {
    useFactory: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...arguments_: any[]
    ) => Promise<StripeModuleOptions> | StripeModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
    isGlobal?: boolean;
}
