import { IsEmail, IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, Min, MinLength, IsUrl } from 'class-validator';

export class InviteDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsIn(['admin', 'user', 'moderator'])
    role: string;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsInt()
    @Min(60) // minimal 1 menit
    @Max(60 * 60 * 24 * 30) // maks 30 hari dalam detik
    expires_in?: number; // detik

    @IsOptional()
    @IsUrl({ require_tld: false })
    redirect_url?: string;
}

export class AcceptInviteDto {
    @IsString()
    token: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'password must contain letter & number' })
    password?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[a-zA-Z0-9_.-]{3,30}$/)
    username?: string;

    @IsOptional()
    @IsString()
    full_name?: string;

    @IsOptional()
    @IsString()
    redirect_url?: string; // client redirect after accept
}

export class RevokeInviteDto {
    @IsUUID()
    inviteId: string;
}

export class UpdateMemberRoleDto {
    @IsString()
    @IsIn(['admin', 'user', 'moderator'])
    role: string;
}
