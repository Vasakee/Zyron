import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754034354839 implements MigrationInterface {
    name = 'Migration1754034354839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api-keys" ADD "username" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api-keys" DROP COLUMN "username"`);
    }

}
