import { ApiProperty } from '@nestjs/swagger';

export class PhotoUploadResponseDto {
    @ApiProperty({
        description: 'Upload success status',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'Success message',
        example: 'Profile photo uploaded successfully',
    })
    message: string;

    @ApiProperty({
        description: 'URL of the uploaded photo',
        example: 'http://localhost:3000/uploads/avatars/user-id-123.jpg',
    })
    avatar_url: string;

    @ApiProperty({
        description: 'Filename of the uploaded photo',
        example: 'user-id-123.jpg',
    })
    filename: string;
}

export class PhotoDeleteResponseDto {
    @ApiProperty({
        description: 'Delete success status',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'Success message',
        example: 'Profile photo deleted successfully',
    })
    message: string;
}
