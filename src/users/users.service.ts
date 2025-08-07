import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { UserRepository } from '../common/repositories/user.repository';
import { UserSessionRepository } from '../common/repositories/user-session.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IPaginationResult } from '../common/repositories/base.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: UserSessionRepository,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<IPaginationResult<User>> {
    return this.userRepository.findWithPaginationAndSearch(
      { page, limit },
      search,
    );
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findByIdWithoutPassword(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const userExists = await this.userRepository.existsByUsernameOrEmail(
      createUserDto.username,
      createUserDto.email,
    );

    if (userExists) {
      throw new ConflictException('Username or email already exists');
    }

    const user = await this.userRepository.create(createUserDto);

    // Return user without password
    return this.findOne(user.id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if username or email is being changed and already exists
    if (updateUserDto.username || updateUserDto.email) {
      const userExists = await this.userRepository.existsByUsernameOrEmail(
        updateUserDto.username || user.username,
        updateUserDto.email || user.email,
        id,
      );

      if (userExists) {
        throw new ConflictException('Username or email already exists');
      }
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if user exists
    await this.userRepository.softDelete(id);
  }

  async restore(id: string): Promise<User> {
    await this.userRepository.restore(id);
    return this.findOne(id);
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    await this.findOne(userId); // Check if user exists
    return this.sessionRepository.getUserSessionsById(userId);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.findOne(userId); // Check if user exists
    await this.sessionRepository.revokeAllUserSessions(userId);
  }
}
