import { Module } from '@nestjs/common';
import { GenerateKitService } from 'src/kit/service/generate-kit';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedKit } from 'src/kit/entity/genrated-kit.entity';
import { GenerateKitCommand } from './commands/test';
import { StripePrice } from 'src/payment/entity/stripe-price.entity';
import { StripeSyncPricesService } from 'src/payment/services/stripe-sync-prices.service';
import { SyncStripePricesCommand } from './commands/sync-stripe-prices';

@Module({
  imports: [TypeOrmModule.forFeature([GeneratedKit, StripePrice])],
  providers: [
    GenerateKitCommand,
    GenerateKitService,
    StripeSyncPricesService,
    SyncStripePricesCommand,
  ],
})
export class CommandModule {}
