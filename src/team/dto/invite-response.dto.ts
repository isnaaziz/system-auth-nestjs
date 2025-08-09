import { ApiProperty, PartialType } from '@nestjs/swagger';
import { InviteDto, AcceptInviteDto, UpdateMemberRoleDto } from './invite.dto';

export class TeamMemberDto {
    @ApiProperty() id: string;
    @ApiProperty({ nullable: true }) full_name?: string;
    @ApiProperty() role: string;
    @ApiProperty() status: string;
}

export class InviteEntityDto {
    @ApiProperty() id: string;
    @ApiProperty() email: string;
    @ApiProperty() role: string;
    @ApiProperty() status: string;
    @ApiProperty({ description: 'Invite token', example: '3f7a2e9c4d8b...' }) token: string;
    @ApiProperty({ nullable: true, type: String }) expires_at?: string;
    @ApiProperty({ nullable: true }) note?: string;
    @ApiProperty({ nullable: true }) redirect_url?: string;
    @ApiProperty({ nullable: true }) inviter_id?: string;
    @ApiProperty() created_at: string;
}

export class InviteDirectAssignDto {
    @ApiProperty({ example: true }) directAssigned: boolean;
    @ApiProperty({ example: 'uuid-of-existing-user' }) userId: string;
}

export class InviteCreateResponseDto {
    @ApiProperty({ oneOf: [{ $ref: '#/components/schemas/InviteEntityDto' }, { $ref: '#/components/schemas/InviteDirectAssignDto' }] })
    result: InviteEntityDto | InviteDirectAssignDto;
}

export class AcceptInviteResponseDto {
    @ApiProperty() access_token: string;
    @ApiProperty() refresh_token: string;
    @ApiProperty() expires_in: number;
    @ApiProperty({ description: 'User info' }) user: any; // simplified
    @ApiProperty({ nullable: true }) redirect_url?: string;
}

export class RevokeInviteResponseDto {
    @ApiProperty({ example: true }) revoked: boolean;
}

export class PurgeExpiredResponseDto {
    @ApiProperty({ example: 2 }) expired_marked: number;
}

export class UpdateMemberRoleResponseDto extends PartialType(UpdateMemberRoleDto) {
    @ApiProperty() id: string;
}

export class RemoveMemberResponseDto {
    @ApiProperty({ example: true }) removed: boolean;
}

export class ListInvitesResponseDto {
    @ApiProperty({ type: [InviteEntityDto] }) invites: InviteEntityDto[];
}
