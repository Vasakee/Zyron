import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1742200295867 implements MigrationInterface {
    name = 'Migration1742200295867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "finalReferenceId" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "finalReferenceId"`);
    }

}
