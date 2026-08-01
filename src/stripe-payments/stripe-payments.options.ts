import type {ModuleMetadata} from "@nestjs/common";

export const STRIPE_PAYMENTS_OPTIONS = "StripePaymentsOptions";

export type StripePaymentsMode = "subscription" | "payment";

export interface StripePaymentsProduct {
    key: string;
    priceId: string;
    mode: StripePaymentsMode;
    internalSku?: string;
    displayName?: string;
}

export interface StripePaymentsModuleOptions {
    accessToken: string;
    webhookVerificationKey: string;
    redirectsBaseUrl: string;
    products: readonly StripePaymentsProduct[];
}

export interface StripePaymentsModuleAsyncOptions extends Pick<
    ModuleMetadata,
    "imports"
> {
    useFactory: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...arguments_: any[]
    ) => Promise<StripePaymentsModuleOptions> | StripePaymentsModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
    isGlobal?: boolean;
}
