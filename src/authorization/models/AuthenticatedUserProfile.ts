import type {Request} from "express";

/**
 * Provider-neutral identity returned after an authentication session is
 * validated. Application authorization remains owned by the Nest backend.
 */
export interface AuthenticatedUserProfile {
    id: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    familyName?: string;
    givenName?: string;
    picture?: string;
    username?: string;
    permissions?: string[];
}

export type AuthenticatedUserProfileResolver = (
    request: Request
) => Promise<AuthenticatedUserProfile | null>;
