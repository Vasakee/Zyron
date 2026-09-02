import { MigrationInterface, QueryRunner } from 'typeorm';

type SeedRow = {
  kitType: string;
  paymentType: string;
  currency: string;
  stripePriceId: string;
  stripeProductId: string | null;
  amountMinor: number;
  mode: string;
  interval: string | null;
  isActive: boolean | number;
  description: string | null;
};

export class Migration1769000000003SeedDeepGutPlusPrices1769000000003
  implements MigrationInterface
{
  name = 'Migration1769000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const configs = [
      {
        kitType: 'deep-gut-plus',
        currency: 'USD',
        envVar: 'STRIPE_USD_DEEP_GUT_PLUS_TEST_PRICE_ID',
        paymentType: 'PLATFORM_ORDER',
      },
      {
        kitType: 'deep-gut-plus',
        currency: 'USD',
        envVar: 'STRIPE_USD_DEEP_GUT_PLUS_TEST_PRICE_ID',
        paymentType: 'WEBSITE_ORDER',
      },
      {
        kitType: 'deep-gut-plus',
        currency: 'CAD',
        envVar: 'STRIPE_CAD_DEEP_GUT_PLUS_TEST_PRICE_ID',
        paymentType: 'PLATFORM_ORDER',
      },
      {
        kitType: 'deep-gut-plus',
        currency: 'CAD',
        envVar: 'STRIPE_CAD_DEEP_GUT_PLUS_TEST_PRICE_ID',
        paymentType: 'WEBSITE_ORDER',
      },
    ] as const;

    const rows: SeedRow[] = [];
    const priceIdsForSync: string[] = [];

    for (const cfg of configs) {
      const priceId = process.env[cfg.envVar];
      if (!priceId) {
        continue;
      }

      priceIdsForSync.push(priceId);
      rows.push({
        kitType: cfg.kitType,
        paymentType: cfg.paymentType,
        currency: cfg.currency,
        stripePriceId: priceId,
        stripeProductId: null,
        amountMinor: 0,
        mode: 'payment',
        interval: null,
        isActive: 1,
        description: null,
      });
    }

    if (rows.length > 0) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('stripe_prices')
        .values(rows)
        .orIgnore()
        .execute();
    }

    if (priceIdsForSync.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        'Stripe prices seeded. Run "RUN_COMMAND=true yarn start:dev sync:stripe-prices --price-ids <ids>" to sync metadata.',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('stripe_prices')
      .where('paymentType IN (:...paymentTypes)', {
        paymentTypes: ['PLATFORM_ORDER', 'WEBSITE_ORDER'],
      })
      .andWhere('kitType IN (:...kits)', {
        kits: ['deep-gut-plus'],
      })
      .andWhere('currency IN (:...currencies)', {
        currencies: ['USD', 'CAD'],
      })
      .execute();
  }
}
