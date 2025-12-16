import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import {
  BaseRepository,
  IPaginationOptions,
  IPaginationResult,
} from '../repositories/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return await this.repository.findOne({
        where: { username, is_deleted: false },
      });
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.repository.findOne({
        where: { email, is_deleted: false },
      });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    try {
      // Use columns that exist in the database according to structure check
      return await this.repository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.username',
          'user.email',
          'user.password',
          'user.full_name',
          'user.phone',
          'user.role',
          'user.status',
          'user.last_login_at',
          'user.email_verified_at',
          'user.email_verification_token',
          'user.password_reset_token',
          'user.password_reset_expires',
          'user.created_at',
          'user.updated_at'
        ])
        .where('(user.username = :identifier OR user.email = :identifier)', {
          identifier: usernameOrEmail,
        })
        .andWhere('user.is_deleted = false')
        .getOne();
    } catch (error) {
      console.error('Error finding user by username or email:', error);
      throw error;
    }
  }

  async existsByUsernameOrEmail(
    username: string,
    email: string,
    excludeId?: string,
  ): Promise<boolean> {
    try {
      const queryBuilder = this.repository
        .createQueryBuilder('user')
        .where('(user.username = :username OR user.email = :email)', {
          username,
          email,
        })
        .andWhere('user.is_deleted = false');

      if (excludeId) {
        queryBuilder.andWhere('user.id != :excludeId', { excludeId });
      }

      const count = await queryBuilder.getCount();
      return count > 0;
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  }

  async findWithPaginationAndSearch(
    options: IPaginationOptions,
    search?: string,
  ): Promise<IPaginationResult<User>> {
    try {
      const { page, limit } = options;
      const skip = (page - 1) * limit;

      const queryBuilder = this.repository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.username',
          'user.email',
          'user.role',
          'user.status',
          'user.last_login_at',
          'user.created_at',
          'user.updated_at',
        ])
        .where('user.is_deleted = false')
        .skip(skip)
        .take(limit)
        .orderBy('user.created_at', 'DESC');

      if (search) {
        queryBuilder.andWhere(
          '(user.username ILIKE :search OR user.email ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error in pagination search:', error);
      throw error;
    }
  }

  async findByIdWithoutPassword(id: string): Promise<User | null> {
    try {
      return await this.repository.findOne({
        where: { id, is_deleted: false },
        select: [
          'id',
          'username',
          'email',
          'role',
          'last_login_at',
          'created_at',
          'updated_at',
        ],
      });
    } catch (error) {
      console.error('Error finding user by ID without password:', error);
      throw error;
    }
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    try {
      return await this.repository.findOne({
        where: { password_reset_token: token, is_deleted: false },
      });
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      throw error;
    }
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}
