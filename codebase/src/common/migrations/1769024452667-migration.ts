import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769024452667 implements MigrationInterface {
    name = 'Migration1769024452667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment-methods" DROP CONSTRAINT "FK_payment_methods_user"`);
        await queryRunner.query(`CREATE TABLE "provider_invites" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_c81353d74a526e234ea39531837" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_4f546432f3cf383bab9a5ab213b" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_55bab8326e850e02dd1c90d675f" DEFAULT GETUTCDATE(), "providerId" uniqueidentifier NOT NULL, "email" varchar(255) NOT NULL, "firstName" varchar(255) NOT NULL, "lastName" varchar(255) NOT NULL, "tokenHash" varchar(255) NOT NULL, "expiresAt" datetime NOT NULL, "acceptedAt" datetime, "createdByUserId" uniqueidentifier, "emailSentAt" datetime, CONSTRAINT "PK_c81353d74a526e234ea39531837" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_91192fef3d7e15f42d8f1a5487" ON "provider_invites" ("providerId", "email") `);
        await queryRunner.query(`ALTER TABLE "orders" ADD "deliveryMode" varchar(255) NOT NULL CONSTRAINT "DF_ced3ade9e2b0000212c8cbf5098" DEFAULT 'dropship'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "stripeId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "metadata"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "metadata" nvarchar(max)`);
        await queryRunner.query(`ALTER TABLE "payment-methods" ADD CONSTRAINT "FK_05347faefe7d008d46ee5d1d531" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "provider_invites" ADD CONSTRAINT "FK_00218e5bbaab4f9b35c3ccda012" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "provider_invites" DROP CONSTRAINT "FK_00218e5bbaab4f9b35c3ccda012"`);
        await queryRunner.query(`ALTER TABLE "payment-methods" DROP CONSTRAINT "FK_05347faefe7d008d46ee5d1d531"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "metadata"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "metadata" nvarchar(MAX) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "stripeId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_ced3ade9e2b0000212c8cbf5098"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deliveryMode"`);
        await queryRunner.query(`DROP INDEX "IDX_91192fef3d7e15f42d8f1a5487" ON "provider_invites"`);
        await queryRunner.query(`DROP TABLE "provider_invites"`);
        await queryRunner.query(`ALTER TABLE "payment-methods" ADD CONSTRAINT "FK_payment_methods_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
