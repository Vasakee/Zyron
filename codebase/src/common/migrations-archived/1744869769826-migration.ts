import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1744869769826 implements MigrationInterface {
    name = 'Migration1744869769826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kit" ADD "healthInfoCompleted" varchar(255) NOT NULL CONSTRAINT "DF_37050d8d0c1cbfcedd1a3ada81d" DEFAULT 'no'`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "healthInfoCompleted" varchar(255) NOT NULL CONSTRAINT "DF_608b8fc952f0d2b89386a8a2971" DEFAULT 'no'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP CONSTRAINT "DF_608b8fc952f0d2b89386a8a2971"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "healthInfoCompleted"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP CONSTRAINT "DF_37050d8d0c1cbfcedd1a3ada81d"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "healthInfoCompleted"`);
    }

}
