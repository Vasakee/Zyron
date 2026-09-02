import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1760449764717 implements MigrationInterface {
    name = 'Migration1760449764717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ADD "currency" varchar(255) NOT NULL CONSTRAINT "DF_9184839196839f283ba7607f454" DEFAULT 'usd'`);
        await queryRunner.query(`CREATE INDEX "IX_ps_finalized_invoice_claimable" ON "payment_statements" ("status", "invoiceId", "nextAttemptAt", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IX_ps_finalized_invoice_claimable" ON "payment_statements"`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" DROP CONSTRAINT "DF_9184839196839f283ba7607f454"`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" DROP COLUMN "currency"`);
    }

}
