import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

@Injectable()
export class FileUploadService {
    private readonly uploadPath = path.join(process.cwd(), 'uploads', 'avatars');
    private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
    private readonly allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    constructor() {
        this.ensureUploadDirectory();
    }

    private async ensureUploadDirectory(): Promise<void> {
        try {
            await mkdir(this.uploadPath, { recursive: true });
        } catch (error) {
            console.error('Failed to create upload directory:', error);
        }
    }

    async uploadAvatar(
        file: UploadedFile,
        userId: string,
    ): Promise<{ filename: string; url: string }> {
        this.validateFile(file);

        const fileExtension = path.extname(file.originalname);
        const filename = `${userId}-${uuidv4()}${fileExtension}`;
        const filePath = path.join(this.uploadPath, filename);

        try {
            await writeFile(filePath, file.buffer);

            const url = `/uploads/avatars/${filename}`;

            return { filename, url };
        } catch (error) {
            throw new InternalServerErrorException('Failed to upload file');
        }
    }

    async deleteAvatar(filename: string): Promise<void> {
        if (!filename) return;

        const filePath = path.join(this.uploadPath, filename);

        try {
            if (fs.existsSync(filePath)) {
                await unlink(filePath);
            }
        } catch (error) {
            console.error('Failed to delete file:', error);
            // Don't throw error, just log it
        }
    }

    private validateFile(file: UploadedFile): void {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        if (file.size > this.maxFileSize) {
            throw new BadRequestException(
                `File size exceeds limit of ${this.maxFileSize / (1024 * 1024)}MB`,
            );
        }

        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed',
            );
        }
    }

    getFileUrl(filename: string): string | null {
        return filename ? `/uploads/avatars/${filename}` : null;
    }
}
