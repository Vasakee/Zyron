import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769000000002 implements MigrationInterface {
  name = 'Migration1769000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasPaymentDate = await queryRunner.hasColumn(
      'kit_replacement_requests',
      'paymentDate',
    );
    if (!hasPaymentDate) {
      await queryRunner.query(
        `ALTER TABLE "kit_replacement_requests" ADD "paymentDate" datetime`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasPaymentDate = await queryRunner.hasColumn(
      'kit_replacement_requests',
      'paymentDate',
    );
    if (hasPaymentDate) {
      await queryRunner.query(
        `ALTER TABLE "kit_replacement_requests" DROP COLUMN "paymentDate"`,
      );
    }
  }
}
