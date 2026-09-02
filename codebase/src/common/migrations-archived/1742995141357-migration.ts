import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1742995141357 implements MigrationInterface {
    name = 'Migration1742995141357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "firstReminderSent"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "secondReminderSent"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "secondReminderSent" datetime`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "firstReminderSent" datetime`);
    }

}
