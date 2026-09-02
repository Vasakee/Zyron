import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1728983083338 implements MigrationInterface {
    name = 'Migration1728983083338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "api-keys" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_ac5d2f5c3b3336bf6ef21044829" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_94041db1be405ee000a686a1501" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_a4cb446e2396517c53f766bb4b2" DEFAULT GETUTCDATE(), "clientId" varchar(255) NOT NULL, "clientSecret" varchar(255) NOT NULL, CONSTRAINT "UQ_b1ea6ee625d1e841ee657618d99" UNIQUE ("clientId"), CONSTRAINT "PK_ac5d2f5c3b3336bf6ef21044829" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "trackingUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "trackingUrl" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "trackingUrl"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "trackingUrl"`);
        await queryRunner.query(`DROP TABLE "api-keys"`);
    }

}
