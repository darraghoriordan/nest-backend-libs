/* eslint-disable @typescript-eslint/naming-convention */
export class UserProfile {
    public sub!: string;
    public name?: string;
    public given_name?: string;
    public family_name?: string;
    public middle_name?: string;
    public nickname?: string;
    public preferred_username?: string;
    public profile?: string;
    public picture!: string;
    public website?: string;
    public email!: string;
    public email_verified!: boolean;
    public gender?: string;
    public birthdate?: string;
    public zoneinfo?: string;
    public locale?: string;
    public phone_number?: string;
    public phone_number_verified!: boolean;
    public address?: {
        country?: string;
    };
    updated_at!: number;
}
