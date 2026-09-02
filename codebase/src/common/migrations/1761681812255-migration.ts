import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1761681812255 implements MigrationInterface {
  name = 'Migration1761681812255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "monthlyBillingAccess" bit NOT NULL CONSTRAINT "DF_4a1c5be401a4e6c1cf1b5680090" DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "DF_4a1c5be401a4e6c1cf1b5680090"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "monthlyBillingAccess"`,
    );
  }
}
