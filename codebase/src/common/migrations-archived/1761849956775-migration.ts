import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1761849956775 implements MigrationInterface {
  name = 'Migration1761849956775';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stripe_checkout_sessions" DROP COLUMN "url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stripe_checkout_sessions" ADD "url" nvarchar(max)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stripe_checkout_sessions" DROP COLUMN "url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stripe_checkout_sessions" ADD "url" varchar(255)`,
    );
  }
}
