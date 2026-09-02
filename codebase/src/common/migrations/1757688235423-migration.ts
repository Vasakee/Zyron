import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1757688235423 implements MigrationInterface {
    name = 'Migration1757688235423'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stripe_checkout_sessions" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_54df0e11a31834ed6cdb6743100" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_66d4549e1f2d967bffba5bb4e8d" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_9fc85e57d34ed3aa074e52a7a70" DEFAULT GETUTCDATE(), "stripeSessionId" varchar(255) NOT NULL, "clientReferenceId" varchar(255), "customerId" varchar(255), "paymentIntentId" varchar(255), "subscriptionId" varchar(255), "status" varchar(255), "paymentStatus" varchar(255), "mode" varchar(255), "amountSubtotal" bigint, "amountTotal" bigint, "currency" varchar(255), "url" varchar(255), "created" bigint, "expiresAt" bigint, "metadata" nvarchar(max), "raw" nvarchar(max), CONSTRAINT "PK_54df0e11a31834ed6cdb6743100" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8332d8228a55667e7ff0fbcc53" ON "stripe_checkout_sessions" ("stripeSessionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_68f5da72e3b90256cd1c2a22ce" ON "stripe_checkout_sessions" ("clientReferenceId") `);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "amount" bigint NOT NULL CONSTRAINT "DF_6d5db1ee200c3b65d2824a077b4" DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "currency" varchar(255) NOT NULL CONSTRAINT "DF_c3dd9222a377f7cdfc954fcf0cd" DEFAULT 'usd'`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "stripeSessionId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "stripeInvoiceId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "stripePaymentIntentId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "promotionCodeId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "paidAt" datetime`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "paidAt"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "promotionCodeId"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "stripePaymentIntentId"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "stripeInvoiceId"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "stripeSessionId"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "DF_c3dd9222a377f7cdfc954fcf0cd"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "DF_6d5db1ee200c3b65d2824a077b4"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "amount"`);
        await queryRunner.query(`DROP INDEX "IDX_68f5da72e3b90256cd1c2a22ce" ON "stripe_checkout_sessions"`);
        await queryRunner.query(`DROP INDEX "IDX_8332d8228a55667e7ff0fbcc53" ON "stripe_checkout_sessions"`);
        await queryRunner.query(`DROP TABLE "stripe_checkout_sessions"`);
    }

}
