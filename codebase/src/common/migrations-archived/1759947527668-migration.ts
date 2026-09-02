import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1759947527668 implements MigrationInterface {
    name = 'Migration1759947527668'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "attemptCount" int NOT NULL CONSTRAINT "DF_2b59bbadcd67cb47d73af26a6e8" DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "lastAttemptAt" datetime`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "nextAttemptAt" datetime`);
        await queryRunner.query(`CREATE INDEX "IX_ps_claimable" ON "payment_statements" ("status", "periodEnd", "nextAttemptAt") `);
        await queryRunner.query(`CREATE INDEX "IX_ps_status_updatedAt" ON "payment_statements" ("status", "updatedAt") `);
        await queryRunner.query(`CREATE INDEX "IX_ps_status_periodEnd_userId_createdAt" ON "payment_statements" ("status", "periodEnd", "userId", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IX_ps_status_periodEnd_userId_createdAt" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_status_updatedAt" ON "payment_statements"`);
        await queryRunner.query(`DROP INDEX "IX_ps_claimable" ON "payment_statements"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "nextAttemptAt"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "lastAttemptAt"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP CONSTRAINT "DF_2b59bbadcd67cb47d73af26a6e8"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "attemptCount"`);
    }

}
