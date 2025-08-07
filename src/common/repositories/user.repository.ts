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
    return this.repository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return this.repository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
  }

  async existsByUsernameOrEmail(
    username: string,
    email: string,
    excludeId?: string,
  ): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder('user')
      .where('user.username = :username OR user.email = :email', {
        username,
        email,
      });

    if (excludeId) {
      queryBuilder.andWhere('user.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async findWithPaginationAndSearch(
    options: IPaginationOptions,
    search?: string,
  ): Promise<IPaginationResult<User>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
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
        'user.updated_at',
      ])
      .skip(skip)
      .take(limit)
      .orderBy('user.created_at', 'DESC');

    if (search) {
      queryBuilder.where(
        'user.username LIKE :search OR user.email LIKE :search OR user.full_name LIKE :search',
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
  }

  async findByIdWithoutPassword(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'email',
        'full_name',
        'phone',
        'role',
        'status',
        'last_login_at',
        'email_verified_at',
        'created_at',
        'updated_at',
      ],
    });
  }
}
