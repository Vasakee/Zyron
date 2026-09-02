import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743606948143 implements MigrationInterface {
    name = 'Migration1743606948143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "kitType" varchar(255) NOT NULL CONSTRAINT "DF_7a16fcfdb50bb5b61a6a82288c8" DEFAULT 'gut-scan'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_7a16fcfdb50bb5b61a6a82288c8"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "kitType"`);
    }

}
