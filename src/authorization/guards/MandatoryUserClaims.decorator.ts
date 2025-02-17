import {SetMetadata} from "@nestjs/common";

export const MandatoryUserClaims = (...mandatoryUserClaims: string[]) =>
    SetMetadata("mandatoryUserClaims", mandatoryUserClaims);
