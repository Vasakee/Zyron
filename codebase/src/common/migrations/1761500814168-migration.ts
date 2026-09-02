import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1761500814168 implements MigrationInterface {
    name = 'Migration1761500814168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payment_statements" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_ae3c9cec06067686147cc138aaa" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_8c8a232fe7d98d3b447d91fc367" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_ae2afa9da1ee2abe7f18c722404" DEFAULT GETUTCDATE(), "userId" uniqueidentifier, "interval" varchar(255) NOT NULL CONSTRAINT "DF_cdda5f8d1d3bbc37f7ab9a92f0f" DEFAULT 'monthly', "currency" varchar(255) NOT NULL, "periodStart" date NOT NULL, "periodEnd" date NOT NULL, "invoiceId" varchar(255), "invoiceNumber" varchar(255), "invoiceUrl" varchar(255), "invoiceStatus" varchar(255), "invoicePdf" varchar(255), "failureReason" nvarchar(max), "status" varchar(255) NOT NULL CONSTRAINT "DF_d96722f057e7c9a1378e3d7384d" DEFAULT 'open', "amountSubtotal" bigint NOT NULL CONSTRAINT "DF_32a07928f9db1fbc284d54d0036" DEFAULT 0, "amountDiscount" bigint NOT NULL CONSTRAINT "DF_bc3da867877c31c3f24854b2bff" DEFAULT 0, "amountTax" bigint NOT NULL CONSTRAINT "DF_9173c121f01b31ed842be7d6cfc" DEFAULT 0, "amountTotal" bigint NOT NULL CONSTRAINT "DF_225b89c7973fb3353e35779bc5b" DEFAULT 0, "paidAt" datetime, "attemptCount" int NOT NULL CONSTRAINT "DF_2b59bbadcd67cb47d73af26a6e8" DEFAULT 0, "lastAttemptAt" datetime, "nextAttemptAt" datetime, CONSTRAINT "PK_ae3c9cec06067686147cc138aaa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX IX_ps_user_invoice_createdAt_id ON payment_statements (userId, createdAt DESC, id) INCLUDE (status) WHERE invoiceId IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX IX_ps_user_createdAt_id ON payment_statements (userId, createdAt DESC, id) INCLUDE (status, invoiceId)`);
        await queryRunner.query(`CREATE INDEX IX_ps_createdAt_id ON payment_statements (createdAt DESC, id) INCLUDE (userId, status, invoiceId)`);
        await queryRunner.query(`CREATE INDEX "IX_ps_expand_user_currency" ON "payment_statements" ("userId", "currency", "status", "periodEnd", "nextAttemptAt") `);
        await queryRunner.query(`CREATE INDEX "IX_ps_finalized_invoice_claimable" ON "payment_statements" ("status", "invoiceId", "nextAttemptAt", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IX_ps_claimable" ON "payment_statements" ("status", "periodEnd", "nextAttemptAt", "userId", "currency", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IX_ps_status_updatedAt" ON "payment_statements" ("status", "updatedAt") `);
        await queryRunner.query(`CREATE INDEX "IX_ps_status_periodEnd_userId_createdAt" ON "payment_statements" ("status", "periodEnd", "userId", "createdAt") `);
        await queryRunner.query(`CREATE TABLE "payment_statement_items" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_41746b1483a2d48a648c0b6cab1" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_832a557c0b11a1ebb6943349ddf" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_420bd6e80caec095feaf0556582" DEFAULT GETUTCDATE(), "paymentStatementId" uniqueidentifier NOT NULL, "orderId" uniqueidentifier NOT NULL, "currency" varchar(255) NOT NULL, "unitAmount" bigint NOT NULL CONSTRAINT "DF_85fb874cefb90cc24a7d11f1a49" DEFAULT 0, "description" varchar(255), "quantity" bigint NOT NULL CONSTRAINT "DF_d7a351cd10d76362fde04710501" DEFAULT 1, "clientName" varchar(255), "clientEmail" varchar(255), CONSTRAINT "PK_41746b1483a2d48a648c0b6cab1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_bd210023bf3e7d139648a12bab" ON "payment_statement_items" ("orderId") WHERE "orderId" IS NOT NULL`);
        await queryRunner.query(`EXEC sp_rename 'transactions.stripePaymentIntentId', 'paymentIntentId', 'COLUMN'`);
        await queryRunner.query(`EXEC sp_rename 'transactions.stripeSessionId', 'sessionId', 'COLUMN'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "currency" varchar(255) NOT NULL CONSTRAINT "DF_41e02301ef95900cb1cc5a355d4" DEFAULT 'usd'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "amountSubtotal" bigint NOT NULL CONSTRAINT "DF_340e25ce8a233ce2d4071d56edf" DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "amountDiscount" bigint NOT NULL CONSTRAINT "DF_21c665bb4f62d6cd8b4407bf2a9" DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "amountTax" bigint NOT NULL CONSTRAINT "DF_986c0284e145deab340a7a4d1ce" DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "amountTotal" bigint NOT NULL CONSTRAINT "DF_47b7243703cb5952fccfa6aaae4" DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "promotionCode" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "promotionCodeId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "invoiceId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "invoiceNumber" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "invoicingMode" varchar(255) NOT NULL CONSTRAINT "DF_aa0649e71adc74b027a9bde28fe" DEFAULT 'eom'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "orderType" varchar(255) NOT NULL CONSTRAINT "DF_f08ef90e85517fc41939c1fc957" DEFAULT 'pay_as_you_go'`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ADD "currency" varchar(255) NOT NULL CONSTRAINT "DF_9184839196839f283ba7607f454" DEFAULT 'usd'`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "firstName" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "email" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD CONSTRAINT "FK_64c921430c63bf054f310af2e4d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD CONSTRAINT "FK_b658b0cd0e8fb7c95e90e433969" FOREIGN KEY ("paymentStatementId") REFERENCES "payment_statements"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD CONSTRAINT "FK_bd210023bf3e7d139648a12babc" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP CONSTRAINT "FK_bd210023bf3e7d139648a12babc"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP CONSTRAINT "FK_b658b0cd0e8fb7c95e90e433969"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP CONSTRAINT "FK_64c921430c63bf054f310af2e4d"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "email" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "firstName" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" DROP CONSTRAINT "DF_9184839196839f283ba7607f454"`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_f08ef90e85517fc41939c1fc957"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderType"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_aa0649e71adc74b027a9bde28fe"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "invoicingMode"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "invoiceNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "invoiceId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "promotionCodeId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "promotionCode"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_47b7243703cb5952fccfa6aaae4"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "amountTotal"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_986c0284e145deab340a7a4d1ce"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "amountTax"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_21c665bb4f62d6cd8b4407bf2a9"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "amountDiscount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_340e25ce8a233ce2d4071d56edf"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "amountSubtotal"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_41e02301ef95900cb1cc5a355d4"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "currency"`);
        await queryRunner.query(`EXEC sp_rename 'transactions.paymentIntentId', 'stripePaymentIntentId', 'COLUMN'`);
        await queryRunner.query(`EXEC sp_rename 'transactions.sessionId', 'stripeSessionId', 'COLUMN'`);
        await queryRunner.query(`DROP INDEX "REL_bd210023bf3e7d139648a12bab" ON "payment_statement_items"`);
        await queryRunner.query(`DROP TABLE "payment_statement_items"`);
        await queryRunner.query(`DROP INDEX "IX_ps_status_periodEnd_userId_createdAt" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_status_updatedAt" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_claimable" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_finalized_invoice_claimable" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_expand_user_currency" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_createdAt_id" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_user_createdAt_id" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_user_invoice_createdAt_id" ON "payment_statements"`);
        await queryRunner.query(`DROP TABLE "payment_statements"`);
    }

}
