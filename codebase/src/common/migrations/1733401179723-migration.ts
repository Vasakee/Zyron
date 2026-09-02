import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1733401179723 implements MigrationInterface {
    name = 'Migration1733401179723'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "quantity" bigint NOT NULL CONSTRAINT "DF_40ce179e66b3ffb0dc6932a8c90" DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_40ce179e66b3ffb0dc6932a8c90"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "quantity"`);
    }

}
