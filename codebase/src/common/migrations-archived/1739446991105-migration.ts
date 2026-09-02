import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1739446991105 implements MigrationInterface {
    name = 'Migration1739446991105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "generated-kits" ADD "barCode" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "generated-kits" DROP COLUMN "barCode"`);
    }

}
