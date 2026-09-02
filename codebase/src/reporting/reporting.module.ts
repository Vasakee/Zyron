import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingController } from './reporting.controller';
import { OrderReportingService } from './service/order-reporting.service';
import { TransactionReportingService } from './service/transaction-reporting.service';
import { StatementReportingService } from './service/statement-reporting.service';
import { PaymentStatementService } from './service/payment-statement.service';
import { Order } from 'src/order/entity/order.entity';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { PaymentStatement } from 'src/payment/entity/payment-statement.entity';
import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';
import { VerifyTokenMiddleware } from 'src/common/middleware';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Transaction,
      PaymentStatement,
      PaymentStatementItem,
      User,
    ]),
  ],
  controllers: [ReportingController],
  providers: [
    OrderReportingService,
    TransactionReportingService,
    StatementReportingService,
    PaymentStatementService,
    RolesGuard,
  ],
  exports: [
    OrderReportingService,
    TransactionReportingService,
    StatementReportingService,
    PaymentStatementService,
  ],
})
export class ReportingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .exclude({
        path: 'reporting/payment-statements/statistics',
        method: RequestMethod.GET,
      })
      .forRoutes('reporting*');
  }
}
