import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from 'src/order/entity/order.entity';
import { ReportingQueryDto, OrderReportDto } from '../dto/reporting.dto';
import { PageOptionsDto, PageMetaDto } from 'src/common';

@Injectable()
export class OrderReportingService {
  private readonly logger = new Logger(OrderReportingService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getOrderReport(pageOptionsDto: PageOptionsDto) {
    try {
      const { take, skip } = pageOptionsDto;

      const dbQuery: SelectQueryBuilder<Order> = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .select([
          'order.id',
          'order.referenceId',
          'order.orderType',
          'order.status',
          'order.currency',
          'order.amountSubtotal',
          'order.amountDiscount',
          'order.amountTax',
          'order.amountTotal',
          'order.promotionCode',
          'order.promotionCodeId',
          'order.invoiceId',
          'order.invoiceNumber',
          'order.quantity',
          'order.createdAt',
          'order.completedAt',
          'user.id',
          'user.firstName',
          'user.lastName',
        ])
        .where('order.userId IS NOT NULL');

      const [orders, total] = await dbQuery
        .take(take)
        .skip(skip)
        .orderBy('order.createdAt', 'DESC')
        .getManyAndCount();

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = orders.map(
        (order) =>
          ({
            id: order.id,
            referenceId: order.referenceId,
            practitionerId: order.user?.id,
            practitionerName: order.user
              ? `${order.user.firstName} ${order.user.lastName}`
              : '',
            orderType: order.orderType,
            status: order.status,
            currency: order.currency,
            amountSubtotal: order.amountSubtotal,
            amountDiscount: order.amountDiscount,
            amountTax: order.amountTax,
            amountTotal: order.amountTotal,
            promotionCode: order.promotionCode,
            promotionCodeId: order.promotionCodeId,
            invoiceId: order.invoiceId,
            invoiceNumber: order.invoiceNumber,
            quantity: order.quantity,
            createdAt: order.createdAt,
            completedAt: order.completedAt,
          } as OrderReportDto),
      );

      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error('Error generating order report:', error);
      throw error;
    }
  }

  async getOrderSummary() {
    try {
      const dbQuery = this.orderRepository
        .createQueryBuilder('order')
        .leftJoin('order.user', 'user')
        .select([
          'order.currency as currency',
          'order.orderType as orderType',
          'COUNT(order.id) as orderCount',
          'SUM(order.amountSubtotal) as totalSubtotal',
          'SUM(order.amountDiscount) as totalDiscount',
          'SUM(order.amountTax) as totalTax',
          'SUM(order.amountTotal) as totalAmount',
        ])
        .where('order.userId IS NOT NULL');

      const summary = await dbQuery
        .groupBy('order.currency')
        .addGroupBy('order.orderType')
        .getRawMany();

      return summary;
    } catch (error) {
      this.logger.error('Error generating order summary:', error);
      throw error;
    }
  }
}
