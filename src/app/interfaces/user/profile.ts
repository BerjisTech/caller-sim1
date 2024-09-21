export interface Profile {
    is_anonymous: boolean;
    is_authenticated: boolean;
    is_superuser: boolean;
    is_staff: boolean;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    avatar?: string;
}
