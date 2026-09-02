import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/entity/order.entity';
import { SaveOrderExternalService } from './services/save-order-external';
import { VerifyTokenMiddlewareExternal } from 'src/common/middleware/verify-external-token';
import { OrdersExternalController } from './order-external.controller';
import { GetOrdersExternalService } from './services/get-orders-external';
@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OrdersExternalController],
  providers: [SaveOrderExternalService, GetOrdersExternalService],
})
export class OrderExternalModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyTokenMiddlewareExternal).forRoutes('external/orders*');
  }
}
