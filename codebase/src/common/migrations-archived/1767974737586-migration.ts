import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767974737586 implements MigrationInterface {
    name = 'Migration1767974737586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new column
        await queryRunner.query(`ALTER TABLE "health_information_dispatch_logs" ADD "lastAttemptedAt" datetime2`);

        // Drop index before altering columns
        await queryRunner.query(`DROP INDEX "IDX_bfd1172ef6edad0cf697b741ae" ON "health_information_dispatch_logs"`);

        // ALTER COLUMN instead of DROP/ADD to preserve data
        await queryRunner.query(`ALTER TABLE "health_information_dispatch_logs" ALTER COLUMN "registeredAt" datetime2 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "health_information_dispatch_logs" ALTER COLUMN "sentAt" datetime2`);

        // Recreate index
        await queryRunner.query(`CREATE INDEX "IDX_bfd1172ef6edad0cf697b741ae" ON "health_information_dispatch_logs" ("status", "registeredAt")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_bfd1172ef6edad0cf697b741ae" ON "health_information_dispatch_logs"`);

        // Revert to datetime
        await queryRunner.query(`ALTER TABLE "health_information_dispatch_logs" ALTER COLUMN "sentAt" datetime`);
        await queryRunner.query(`ALTER TABLE "health_information_dispatch_logs" ALTER COLUMN "registeredAt" datetime NOT NULL`);

        await queryRunner.query(`CREATE INDEX "IDX_bfd1172ef6edad0cf697b741ae" ON "health_information_dispatch_logs" ("status", "registeredAt")`);
        await queryRunner.query(`ALTER TABLE "health_information_dispatch_logs" DROP COLUMN "lastAttemptedAt"`);
    }
}