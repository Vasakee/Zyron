import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
} from 'typeorm';
import { CustomerProfile } from '../entity/customer-profile.entity';
import { FetchCustomerProfilesDto } from '../dto/fetch-customer-profiles.dto';
import { PageMetaDto, PageOptionsDto } from 'src/common';

@Injectable()
export class GetCustomerProfilesService {
  private readonly logger = new Logger(GetCustomerProfilesService.name);

  constructor(
    @InjectRepository(CustomerProfile)
    private readonly repo: Repository<CustomerProfile>,
  ) {}

  async execute(
    userId: string,
    pageOptionsDto: PageOptionsDto,
    searchQuery?: string,
  ): Promise<{ result: FetchCustomerProfilesDto[]; pageMetaDto: PageMetaDto }> {
    try {
      const { take, skip } = pageOptionsDto;

      const where:
        | FindOptionsWhere<CustomerProfile>
        | FindOptionsWhere<CustomerProfile>[] = searchQuery
        ? [
            { userId, clientName: ILike(`%${searchQuery}%`) },
            { userId, kitId: searchQuery },
          ]
        : { userId };

      const order: FindOptionsOrder<CustomerProfile> = { createdAt: 'DESC' };

      const dbQuery: FindManyOptions<CustomerProfile> = {
        where,
        skip,
        take,
        order,
      };

      const [profiles, total] = await Promise.all([
        this.repo.find(dbQuery),
        this.repo.count({ where }),
      ]);

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = profiles.map((p) =>
        new FetchCustomerProfilesDto().fromEntity(p),
      );

      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
