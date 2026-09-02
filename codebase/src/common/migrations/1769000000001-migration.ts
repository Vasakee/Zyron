import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769000000001 implements MigrationInterface {
  name = 'Migration1769000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UX_ps_open_user_currency_interval_period" ON "payment_statements" ("userId", "currency", "interval", "periodStart") WHERE status = 'open'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "UX_ps_open_user_currency_interval_period" ON "payment_statements"`,
    );
  }
}
