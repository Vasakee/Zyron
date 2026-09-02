import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { Order } from 'src/order/entity/order.entity';
import { ReportingQueryDto, TransactionReportDto } from '../dto/reporting.dto';
import { PageOptionsDto, PageMetaDto } from 'src/common';

@Injectable()
export class TransactionReportingService {
  private readonly logger = new Logger(TransactionReportingService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getTransactionReport(pageOptionsDto: PageOptionsDto) {
    try {
      const { take, skip } = pageOptionsDto;

      const dbQuery: SelectQueryBuilder<Transaction> =
        this.transactionRepository
          .createQueryBuilder('transaction')
          .leftJoinAndSelect('transaction.user', 'user')
          .leftJoin(
            Order,
            'order',
            'order.referenceId = transaction.referenceId',
          )
          .select([
            'transaction.id',
            'transaction.referenceId',
            'transaction.type',
            'transaction.status',
            'transaction.gateway',
            'transaction.amount',
            'transaction.currency',
            'transaction.stripeInvoiceId',
            'transaction.paymentIntentId',
            'transaction.promotionCodeId',
            'transaction.paidAt',
            'transaction.createdAt',
            'user.id',
            'user.firstName',
            'user.lastName',
            'order.referenceId as orderReferenceId',
          ])
          .where('transaction.userId IS NOT NULL');

      const [transactions, total] = await dbQuery
        .take(take)
        .skip(skip)
        .orderBy('transaction.createdAt', 'DESC')
        .getManyAndCount();

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const result = transactions.map(
        (transaction) =>
          ({
            id: transaction.id,
            referenceId: transaction.referenceId,
            practitionerId: transaction.user?.id,
            practitionerName: transaction.user
              ? `${transaction.user.firstName} ${transaction.user.lastName}`
              : '',
            orderReferenceId: transaction.referenceId,
            type: transaction.type,
            status: transaction.status,
            gateway: transaction.gateway,
            amount: transaction.amount,
            currency: transaction.currency,
            invoiceId: transaction.stripeInvoiceId,
            invoiceNumber: transaction.stripeInvoiceId,
            paymentIntentId: transaction.paymentIntentId,
            promotionCodeId: transaction.promotionCodeId,
            paidAt: transaction.paidAt,
            createdAt: transaction.createdAt,
          } as TransactionReportDto),
      );

      return { result, pageMetaDto };
    } catch (error) {
      this.logger.error('Error generating transaction report:', error);
      throw error;
    }
  }

  async getTransactionReconciliation() {
    try {
      const dbQuery = this.transactionRepository
        .createQueryBuilder('transaction')
        .leftJoin('transaction.user', 'user')
        .select([
          'transaction.stripeInvoiceId',
          'transaction.paymentIntentId',
          'transaction.status',
          'transaction.currency',
          'COUNT(transaction.id) as transactionCount',
          'SUM(transaction.amount) as totalAmount',
          "SUM(CASE WHEN transaction.status = 'successful' THEN transaction.amount ELSE 0 END) as successfulAmount",
          "SUM(CASE WHEN transaction.status = 'failed' THEN transaction.amount ELSE 0 END) as failedAmount",
        ])
        .where('transaction.userId IS NOT NULL')
        .andWhere(
          '(transaction.stripeInvoiceId IS NOT NULL OR transaction.paymentIntentId IS NOT NULL)',
        );

      const reconciliation = await dbQuery
        .groupBy('transaction.stripeInvoiceId')
        .addGroupBy('transaction.paymentIntentId')
        .addGroupBy('transaction.currency')
        .getRawMany();

      return reconciliation;
    } catch (error) {
      this.logger.error('Error generating transaction reconciliation:', error);
      throw error;
    }
  }

  async getTransactionSummary() {
    try {
      const dbQuery = this.transactionRepository
        .createQueryBuilder('transaction')
        .leftJoin('transaction.user', 'user')
        .select([
          'transaction.currency as currency',
          'transaction.status as status',
          'transaction.gateway as gateway',
          'COUNT(transaction.id) as transactionCount',
          'SUM(transaction.amount) as totalAmount',
        ])
        .where('transaction.userId IS NOT NULL');

      const summary = await dbQuery
        .groupBy('transaction.currency')
        .addGroupBy('transaction.status')
        .addGroupBy('transaction.gateway')
        .getRawMany();

      return summary;
    } catch (error) {
      this.logger.error('Error generating transaction summary:', error);
      throw error;
    }
  }
}
