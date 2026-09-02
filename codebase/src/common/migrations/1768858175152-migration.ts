import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1768858175152 implements MigrationInterface {
    name = 'Migration1768858175152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "kit_replacement_requests" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_a2fe123c87a301250d64fa748b1" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_201b20a0c62350ddbfbc2799898" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_5ed0714222c72ac7992897cff10" DEFAULT GETUTCDATE(), "referenceId" varchar(100) NOT NULL, "targetType" varchar(30) NOT NULL, "practitionerId" uniqueidentifier, "firstName" varchar(100) NOT NULL, "lastName" varchar(100) NOT NULL, "email" varchar(255) NOT NULL, "kitType" varchar(50) NOT NULL, "currency" varchar(10) NOT NULL, "quantity" int NOT NULL, "country" varchar(50) NOT NULL, "addressLineOne" varchar(255) NOT NULL, "addressLineTwo" varchar(255), "city" varchar(100) NOT NULL, "state" varchar(100) NOT NULL, "postalCode" varchar(20) NOT NULL, "status" varchar(30) NOT NULL, "paymentUrl" nvarchar(max), "paymentSessionId" varchar(255), "paymentDate" datetime, "createdByAdminId" uniqueidentifier NOT NULL, CONSTRAINT "UQ_de024d3c22139cba18ecf55761f" UNIQUE ("referenceId"), CONSTRAINT "PK_a2fe123c87a301250d64fa748b1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_869ddc9049e1b0d46e90a2ef7a" ON "kit_replacement_requests" ("practitionerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3b1dc1d9ba15fc5334e3f00df3" ON "kit_replacement_requests" ("status") `);
        await queryRunner.query(`CREATE TABLE "stripe_prices" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_92095112c498da118e07f686d0a" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_ca8769cf4bfb594842b1973e9f1" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_5e182817cf2b8c36ad5927ca92f" DEFAULT GETUTCDATE(), "kitType" varchar(50) NOT NULL, "paymentType" varchar(50) NOT NULL, "currency" varchar(10) NOT NULL, "stripePriceId" varchar(255) NOT NULL, "preOrderPriceId" varchar(255), "stripeProductId" varchar(255), "amountMinor" bigint NOT NULL, "mode" varchar(20) NOT NULL, "interval" varchar(20), "isActive" bit NOT NULL CONSTRAINT "DF_0cff90fa0bc2b45742ad1f9ecd7" DEFAULT 1, "description" nvarchar(255), CONSTRAINT "PK_92095112c498da118e07f686d0a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_stripe_prices_active" ON "stripe_prices" ("isActive") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_stripe_prices_active" ON "stripe_prices" ("kitType", "paymentType", "currency") WHERE "isActive" = 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "UQ_stripe_prices_active" ON "stripe_prices"`);
        await queryRunner.query(`DROP INDEX "IDX_stripe_prices_active" ON "stripe_prices"`);
        await queryRunner.query(`DROP TABLE "stripe_prices"`);
        await queryRunner.query(`DROP INDEX "IDX_3b1dc1d9ba15fc5334e3f00df3" ON "kit_replacement_requests"`);
        await queryRunner.query(`DROP INDEX "IDX_869ddc9049e1b0d46e90a2ef7a" ON "kit_replacement_requests"`);
        await queryRunner.query(`DROP TABLE "kit_replacement_requests"`);
    }

}
