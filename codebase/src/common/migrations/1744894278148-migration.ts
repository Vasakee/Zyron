import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1744894278148 implements MigrationInterface {
    name = 'Migration1744894278148'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kit" ADD "healthInfoCompleted" varchar(255) NOT NULL CONSTRAINT "DF_37050d8d0c1cbfcedd1a3ada81d" DEFAULT 'no'`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "submitted" bit NOT NULL CONSTRAINT "DF_6328351673f78a849d9b0a20399" DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "healthInfoCompleted" varchar(255) NOT NULL CONSTRAINT "DF_608b8fc952f0d2b89386a8a2971" DEFAULT 'no'`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "submitted" bit NOT NULL CONSTRAINT "DF_a6366b5fc9f9cede989ccf8cc82" DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP CONSTRAINT "DF_a6366b5fc9f9cede989ccf8cc82"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "submitted"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP CONSTRAINT "DF_608b8fc952f0d2b89386a8a2971"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "healthInfoCompleted"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP CONSTRAINT "DF_6328351673f78a849d9b0a20399"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "submitted"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP CONSTRAINT "DF_37050d8d0c1cbfcedd1a3ada81d"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "healthInfoCompleted"`);
    }

}
