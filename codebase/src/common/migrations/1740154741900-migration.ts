import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1740154741900 implements MigrationInterface {
    name = 'Migration1740154741900'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "generated-kits" DROP COLUMN "barCode"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "trackingEmailStatus" bit NOT NULL CONSTRAINT "DF_befb83f78b8e64de47a8c2bf105" DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_befb83f78b8e64de47a8c2bf105"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "trackingEmailStatus"`);
        await queryRunner.query(`ALTER TABLE "generated-kits" ADD "barCode" text`);
    }

}
