import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764682277178 implements MigrationInterface {
  name = 'Migration1764682277178';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
  CREATE INDEX IX_ps_createdAt_id ON payment_statements (createdAt DESC, id) INCLUDE (userId, status, invoiceId)
`);

    await queryRunner.query(`
  CREATE INDEX IX_ps_user_createdAt_id ON payment_statements (userId, createdAt DESC, id) INCLUDE (status, invoiceId)
`);

    await queryRunner.query(`
  CREATE INDEX IX_ps_user_invoice_createdAt_id ON payment_statements (userId, createdAt DESC, id) INCLUDE (status) WHERE invoiceId IS NOT NULL
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IX_ps_user_invoice_createdAt_id" ON "payment_statements"`,
    );
    await queryRunner.query(
      `DROP INDEX "IX_ps_user_createdAt_id" ON "payment_statements"`,
    );
    await queryRunner.query(
      `DROP INDEX "IX_ps_createdAt_id" ON "payment_statements"`,
    );
  }
}
