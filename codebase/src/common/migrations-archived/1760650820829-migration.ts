import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1760650820829 implements MigrationInterface {
    name = 'Migration1760650820829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IX_ps_claimable" ON "payment_statements"`);
        await queryRunner.query(`CREATE INDEX IX_ps_user_invoice_createdAt_id ON payment_statements (userId, createdAt DESC, id) INCLUDE (status) WHERE invoiceId IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX IX_ps_user_createdAt_id ON payment_statements (userId, createdAt DESC, id) INCLUDE (status, invoiceId)`);
        await queryRunner.query(`CREATE INDEX IX_ps_createdAt_id ON payment_statements (createdAt DESC, id) INCLUDE (userId, status, invoiceId)`);
        await queryRunner.query(`CREATE INDEX "IX_ps_expand_user_currency" ON "payment_statements" ("userId", "currency", "status", "periodEnd", "nextAttemptAt") `);
        await queryRunner.query(`CREATE INDEX "IX_ps_claimable" ON "payment_statements" ("status", "periodEnd", "nextAttemptAt", "userId", "currency", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IX_ps_claimable" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_expand_user_currency" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_createdAt_id" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_user_createdAt_id" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_user_invoice_createdAt_id" ON "payment_statements"`);
        await queryRunner.query(`CREATE INDEX "IX_ps_claimable" ON "payment_statements" ("status", "periodEnd", "nextAttemptAt") `);
    }

}
