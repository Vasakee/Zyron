import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1751059026305 implements MigrationInterface {
    name = 'Migration1751059026305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "extra_shipping_packages" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_0b6b83103459c909def4177e71e" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_8927ec8e6b95c90ff7ce6f28e45" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_f3bb8bd49f5fec5c46d5cd81f52" DEFAULT GETUTCDATE(), "trackingNumber" varchar(255), "trackingUrl" varchar(255), "quantity" bigint NOT NULL CONSTRAINT "DF_19b9ecfc8faeff23a9ae20ab68b" DEFAULT 1, "orderId" uniqueidentifier NOT NULL, CONSTRAINT "PK_0b6b83103459c909def4177e71e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "subPractitionerName" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "kit" ALTER COLUMN "taxonomyUrl" NVARCHAR(MAX)`);
        await queryRunner.query(`ALTER TABLE "kit" ALTER COLUMN "amrUrl" NVARCHAR(MAX)`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ALTER COLUMN "taxonomyUrl" NVARCHAR(MAX)`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ALTER COLUMN "amrUrl" NVARCHAR(MAX)`);
        await queryRunner.query(`ALTER TABLE "extra_shipping_packages" ADD CONSTRAINT "FK_e0f8c2f0c46a6508605a0d45c9e" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "extra_shipping_packages" DROP CONSTRAINT "FK_e0f8c2f0c46a6508605a0d45c9e"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ALTER COLUMN "amrUrl" VARCHAR(255)`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ALTER COLUMN "taxonomyUrl" VARCHAR(255)`);
        await queryRunner.query(`ALTER TABLE "kit" ALTER COLUMN "amrUrl" VARCHAR(255)`);
        await queryRunner.query(`ALTER TABLE "kit" ALTER COLUMN "taxonomyUrl" VARCHAR(255)`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "subPractitionerName"`);
        await queryRunner.query(`DROP TABLE "extra_shipping_packages"`);
    }

}
