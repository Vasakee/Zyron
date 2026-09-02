import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764200000000 implements MigrationInterface {
  name = 'Migration1764200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "monthlyBillingAccess" bit NOT NULL CONSTRAINT "DF_c3f63f424a941d96c423f0c5b7a" DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "DF_c3f63f424a941d96c423f0c5b7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "monthlyBillingAccess"`,
    );
  }
}
