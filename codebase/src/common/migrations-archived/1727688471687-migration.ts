import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1727688471687 implements MigrationInterface {
    name = 'Migration1727688471687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support-message" ADD "status" varchar(255) NOT NULL CONSTRAINT "DF_7404e5bc702df17a0b6eeec9d11" DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support-message" DROP CONSTRAINT "DF_7404e5bc702df17a0b6eeec9d11"`);
        await queryRunner.query(`ALTER TABLE "support-message" DROP COLUMN "status"`);
    }

}
