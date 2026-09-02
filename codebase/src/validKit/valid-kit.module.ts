import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { VerifyTokenMiddleware } from 'src/common/middleware';
import { ValidKitController } from './valid-kit.controller';
import { CreateValidKitService } from './service/bulk-insert-valid-kit.ts';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ValidKit } from './entity/valid-kit.entity';
import { GetAllValidKitService } from './service/get-valid-kit';

@Module({
  imports: [TypeOrmModule.forFeature([ValidKit])],
  controllers: [ValidKitController],
  providers: [CreateValidKitService, GetAllValidKitService],
})
export class ValidKitModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(VerifyTokenMiddleware).exclude().forRoutes('validKits*');
  }
}
