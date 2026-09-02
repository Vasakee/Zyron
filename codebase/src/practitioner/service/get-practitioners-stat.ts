import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Practitioner } from '../entity/practitioner.entity';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import {
  CreatePractitionerAccountDto,
  PractitionerQueryDto,
} from '../dto/create-practitioner-dto';
import { AccountStatus, Source } from 'src/enum';
import { Order } from 'src/order/entity/order.entity';

@Injectable()
export class GetPractitionerStatsService {
  private readonly logger = new Logger(GetPractitionerStatsService.name);

  constructor(
    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async execute(pageOptionsDto: PageOptionsDto, query: PractitionerQueryDto) {
    const { take, skip } = pageOptionsDto;
    const { searchQuery } = query;
    const sort = 'DESC';

    try {
      const dbQuery = this.practitionerRepo
        .createQueryBuilder('practitioner')
        .leftJoinAndSelect('practitioner.user', 'user')
        .where('user.status = :status', { status: AccountStatus.ACTIVE });

      if (searchQuery) {
        dbQuery.andWhere(
          new Brackets((qb) => {
            qb.where('practitioner.practiceName LIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            })
              .orWhere('user.firstName LIKE :searchQuery', {
                searchQuery: `%${searchQuery}%`,
              })
              .orWhere('user.lastName LIKE :searchQuery', {
                searchQuery: `%${searchQuery}%`,
              });
          }),
        );
      }

      const [practitioners, total] = await dbQuery
        .take(take)
        .skip(skip)
        .orderBy('practitioner.createdAt', sort)
        .getManyAndCount();

      const stats = await Promise.all(
        practitioners.map(async (practitioner) => {
          const userId = practitioner.user.id;

          const orderQuery = this.orderRepo
            .createQueryBuilder('order')
            .select([
              'MIN(order.createdAt) AS firstOrderDate',
              'MAX(order.createdAt) AS lastOrderDate',
              'SUM(CAST(order.quantity AS INT)) AS totalKits',
              'MIN(order.country) AS country',
            ])
            .where('order.userId = :userId', { userId });

          const orderSummary = await orderQuery.getRawOne();

          return {
            name: `${practitioner.user.firstName} ${practitioner.user.lastName}`,
            practiseName: practitioner.practiceName,
            practiceurl: practitioner.practiceUrl,
            email: practitioner.user.email,
            phone: practitioner.user.phone,
            degree: practitioner.degree,
            gutTestUsed: practitioner.gutTestUsedName,
            monthlyClients: practitioner.monthlyClients,
            practitionerType: practitioner.practitionerType,
            stateLocation: practitioner.stateLocation,
            cityLocation: practitioner.cityLocation,
            zipcode: practitioner.zipCode,
            country: orderSummary?.country || '',
            dateRegistered: practitioner.createdAt,
            dateOfFirstOrder: orderSummary?.firstOrderDate ?? null,
            dateOfLastOrder: orderSummary?.lastOrderDate ?? null,
            totalKits: parseInt(orderSummary?.totalKits || '0', 10),
          };
        }),
      );

      const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto });
      return { practitioners: stats, pageMetaDto };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
