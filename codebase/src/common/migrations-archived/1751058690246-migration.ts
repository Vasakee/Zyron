import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1751058690246 implements MigrationInterface {
  name = 'Migration1751058690246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kit" ALTER COLUMN "taxonomyUrl" NVARCHAR(MAX)`,
    );
    await queryRunner.query(
      `ALTER TABLE "kit" ALTER COLUMN "amrUrl" NVARCHAR(MAX)`,
    );
    await queryRunner.query(
      `ALTER TABLE "practitioner-kits" ALTER COLUMN "taxonomyUrl" NVARCHAR(MAX)`,
    );
    await queryRunner.query(
      `ALTER TABLE "practitioner-kits" ALTER COLUMN "amrUrl" NVARCHAR(MAX)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "practitioner-kits" ALTER COLUMN "amrUrl" VARCHAR(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "practitioner-kits" ALTER COLUMN "taxonomyUrl" VARCHAR(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "kit" ALTER COLUMN "amrUrl" VARCHAR(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "kit" ALTER COLUMN "taxonomyUrl" VARCHAR(255)`,
    );
  }
}
