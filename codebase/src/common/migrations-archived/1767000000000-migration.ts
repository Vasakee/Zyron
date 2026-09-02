import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1767000000000 implements MigrationInterface {
  name = 'Migration1767000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stripe_prices" ADD "preOrderPriceId" varchar(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stripe_prices" DROP COLUMN "preOrderPriceId"`,
    );
  }
}
