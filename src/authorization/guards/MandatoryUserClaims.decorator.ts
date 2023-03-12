import {SetMetadata} from "@nestjs/common";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const MandatoryUserClaims = (...mandatoryUserClaims: string[]) =>
    SetMetadata("mandatoryUserClaims", mandatoryUserClaims);
