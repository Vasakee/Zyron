import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765796000000 implements MigrationInterface {
    name = 'Migration1765796000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stripe_prices" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_stripe_prices_id" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_stripe_prices_createdAt" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_stripe_prices_updatedAt" DEFAULT GETUTCDATE(), "kitType" varchar(50) NOT NULL, "paymentType" varchar(50) NOT NULL, "currency" varchar(10) NOT NULL, "stripePriceId" varchar(255) NOT NULL, "stripeProductId" varchar(255), "amountMinor" bigint NOT NULL, "mode" varchar(20) NOT NULL, "interval" varchar(20), "isActive" bit NOT NULL CONSTRAINT "DF_stripe_prices_isActive" DEFAULT 1, "description" nvarchar(255), CONSTRAINT "PK_stripe_prices_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_stripe_prices_active" ON "stripe_prices" ("kitType", "paymentType", "currency") WHERE "isActive" = 1`);
        await queryRunner.query(`CREATE INDEX "IDX_stripe_prices_active" ON "stripe_prices" ("isActive") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_stripe_prices_active" ON "stripe_prices"`);
        await queryRunner.query(`DROP INDEX "UQ_stripe_prices_active" ON "stripe_prices"`);
        await queryRunner.query(`DROP TABLE "stripe_prices"`);
    }

}
