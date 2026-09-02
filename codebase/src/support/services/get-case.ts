import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { SupportDto, SupportQueryDto } from '../dto/support.dto';
import { Support } from '../entity/support.entity';
import { PageMetaDto, PageOptionsDto } from 'src/common';
import { SupportMessage } from '../entity/support-message.entity';

@Injectable()
export class GetCaseService {
  private readonly logger = new Logger(GetCaseService.name);
  constructor(
    @InjectRepository(Support)
    private readonly supportRepo: Repository<Support>,
    @InjectRepository(SupportMessage)
    private readonly supportMessageRepo: Repository<SupportMessage>,
  ) {}
  async execute(pageOptionsDto: PageOptionsDto, query: SupportQueryDto) {
    try {
      const { take, skip } = pageOptionsDto;

      const { searchQuery, status, priority, assignedTo, dateFrom, dateTo } =
        query;
      const where: FindOptionsWhere<Support> = {};

      if (searchQuery) {
        where.subject = ILike(`%${searchQuery}%`);
        // where.inquiryId = ILike(`%${searchQuery}%`);
      }

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      if (assignedTo) {
        where.assigneeId = assignedTo;
      }

      if(dateTo && dateFrom){
        where.createdAt = Between(dateFrom, dateTo);
      }

      const order: FindOptionsOrder<Support> = { createdAt: 'DESC' };

      const dbQuery: FindManyOptions<Support> = {
        where,
        skip,
        take,
        order,
        relations: ['user', 'assignedTo'],
      };

      const [cases, total, allCases] = await Promise.all([
        this.supportRepo.find(dbQuery),
        this.supportRepo.count({ where }),
        this.supportRepo.find({ where, select: ['id', 'status'] }),
      ]);

      const sortCases = allCases.reduce((counts, entity) => {
        counts[entity.status] = (counts[entity.status] || 0) + 1;
        return counts;
      }, {});

      const statusCounts = Object.entries(sortCases).map(([status, count]) => ({
        status,
        count,
      }));

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = cases.map((eq) => new SupportDto().fromEntity(eq));

      return { result, pageMetaDto, statusCounts };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
