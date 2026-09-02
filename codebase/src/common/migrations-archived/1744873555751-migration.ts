import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1744873555751 implements MigrationInterface {
    name = 'Migration1744873555751'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kit" ADD "submitted" bit NOT NULL CONSTRAINT "DF_6328351673f78a849d9b0a20399" DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "submitted" bit NOT NULL CONSTRAINT "DF_a6366b5fc9f9cede989ccf8cc82" DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP CONSTRAINT "DF_a6366b5fc9f9cede989ccf8cc82"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "submitted"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP CONSTRAINT "DF_6328351673f78a849d9b0a20399"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "submitted"`);
    }

}
