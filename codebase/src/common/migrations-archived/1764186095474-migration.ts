import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1764186095474 implements MigrationInterface {
    name = 'Migration1764186095474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IX_ps_user_invoice_createdAt_id" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_user_createdAt_id" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_createdAt_id" ON "payment_statements"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "paymentUrl" nvarchar(max)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paymentUrl"`);
        await queryRunner.query(`CREATE INDEX "IX_ps_createdAt_id" ON "payment_statements" ("createdAt", "id", "userId", "status", "invoiceId") `);
        await queryRunner.query(`CREATE INDEX "IX_ps_user_createdAt_id" ON "payment_statements" ("userId", "createdAt", "id", "status", "invoiceId") `);
        await queryRunner.query(`CREATE INDEX "IX_ps_user_invoice_createdAt_id" ON "payment_statements" ("userId", "createdAt", "id", "status") WHERE ([invoiceId] IS NOT NULL)`);
    }

}
