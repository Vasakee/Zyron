import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1764683713525 implements MigrationInterface {
    name = 'Migration1764683713525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "paymentUrl" nvarchar(max)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paymentUrl"`);
    }

}
