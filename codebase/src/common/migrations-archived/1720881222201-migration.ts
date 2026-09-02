import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1720881222201 implements MigrationInterface {
    name = 'Migration1720881222201'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "metadata"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "metadata" nvarchar(max)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "metadata"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "metadata" nvarchar(MAX) NOT NULL`);
    }

}
