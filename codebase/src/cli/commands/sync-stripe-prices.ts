import { Injectable } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { StripeSyncPricesService } from 'src/payment/services/stripe-sync-prices.service';

type SyncStripePricesOptions = {
  priceIds?: string;
};

@Injectable()
@Command({
  name: 'sync:stripe-prices',
  description: 'Sync Stripe price metadata into the local stripe_prices table.',
})
export class SyncStripePricesCommand extends CommandRunner {
  constructor(
    private readonly stripeSyncPricesService: StripeSyncPricesService,
  ) {
    super();
  }

  async run(
    _inputs: string[],
    options?: SyncStripePricesOptions,
  ): Promise<void> {
    const priceIds = options?.priceIds
      ? options.priceIds
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      : undefined;

    const result = await this.stripeSyncPricesService.sync(priceIds);

    console.log(`Stripe price sync complete. Updated: ${result.updated}`);
  }

  @Option({
    flags: '-p, --price-ids [priceIds]',
    description: 'Comma-separated list of Stripe price IDs to sync.',
  })
  parsePriceIds(value?: string) {
    return value;
  }
}
