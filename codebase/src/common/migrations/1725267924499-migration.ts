import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1725267924499 implements MigrationInterface {
    name = 'Migration1725267924499'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "support" ADD "message" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "support" ADD "message" varchar(255)`);
    }

}
