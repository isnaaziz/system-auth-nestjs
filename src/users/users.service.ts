import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSession, SessionStatus } from '../entities/user-session.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserSession)
        private readonly sessionRepository: Repository<UserSession>,
    ) { }

    async findAll(page: number = 1, limit: number = 10, search?: string) {
        const skip = (page - 1) * limit;

        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.username',
                'user.email',
                'user.full_name',
                'user.phone',
                'user.role',
                'user.status',
                'user.last_login_at',
                'user.email_verified_at',
                'user.created_at',
                'user.updated_at'
            ])
            .skip(skip)
            .take(limit)
            .orderBy('user.created_at', 'DESC');

        if (search) {
            queryBuilder.where(
                'user.username LIKE :search OR user.email LIKE :search OR user.full_name LIKE :search',
                { search: `%${search}%` }
            );
        }

        const [users, total] = await queryBuilder.getManyAndCount();

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: [
                'id', 'username', 'email', 'full_name', 'phone', 'role', 'status',
                'last_login_at', 'email_verified_at', 'created_at', 'updated_at'
            ],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: [
                { username: createUserDto.username },
                { email: createUserDto.email },
            ],
        });

        if (existingUser) {
            throw new ConflictException('Username or email already exists');
        }

        const user = this.userRepository.create(createUserDto);
        const savedUser = await this.userRepository.save(user);

        // Return user without password
        return this.findOne(savedUser.id);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        // Check if username or email is being changed and already exists
        if (updateUserDto.username || updateUserDto.email) {
            const existingUser = await this.userRepository
                .createQueryBuilder('user')
                .where('user.id != :id', { id })
                .andWhere('(user.username = :username OR user.email = :email)', {
                    username: updateUserDto.username || '',
                    email: updateUserDto.email || '',
                })
                .getOne();

            if (existingUser) {
                throw new ConflictException('Username or email already exists');
            }
        }

        Object.assign(user, updateUserDto);
        await this.userRepository.save(user);

        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.softDelete(id);
    }

    async restore(id: string): Promise<User> {
        await this.userRepository.restore(id);
        return this.findOne(id);
    }

    async getUserSessions(userId: string): Promise<UserSession[]> {
        await this.findOne(userId); // Check if user exists

        return this.sessionRepository.find({
            where: { user_id: userId },
            order: { last_activity_at: 'DESC' },
        });
    }

    async revokeAllUserSessions(userId: string): Promise<void> {
        await this.findOne(userId); // Check if user exists

        await this.sessionRepository.update(
            { user_id: userId, status: SessionStatus.ACTIVE },
            { status: SessionStatus.REVOKED },
        );
    }
}
