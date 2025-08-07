import { Repository, SelectQueryBuilder, FindManyOptions } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';

export interface IPaginationOptions {
  page: number;
  limit: number;
}

export interface IPaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as any);
    return this.repository.save(entity as any);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    await this.repository.update(id, data as any);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.repository.restore(id);
  }

  async paginate(
    options: IPaginationOptions,
    searchOptions?: FindManyOptions<T>,
  ): Promise<IPaginationResult<T>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      ...searchOptions,
      skip,
      take: limit,
    });

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

  createQueryBuilder(alias: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }
}
