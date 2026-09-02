import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1741947925644 implements MigrationInterface {
    name = 'Migration1741947925644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_befb83f78b8e64de47a8c2bf105"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "trackingEmailStatus"`);
        await queryRunner.query(`ALTER TABLE "generated-kits" ADD "barCode" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "generated-kits" DROP COLUMN "barCode"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "trackingEmailStatus" bit NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "DF_befb83f78b8e64de47a8c2bf105" DEFAULT 0 FOR "trackingEmailStatus"`);
    }

}
