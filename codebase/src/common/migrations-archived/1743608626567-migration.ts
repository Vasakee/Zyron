import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743608626567 implements MigrationInterface {
    name = 'Migration1743608626567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kit" ADD "kitType" varchar(255) NOT NULL CONSTRAINT "DF_4ea45f9f932c7c176a2cba689be" DEFAULT 'gut-scan'`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "amrUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "kitType" varchar(255) NOT NULL CONSTRAINT "DF_ac4d1c1d0d0bb14b7d20b244f5f" DEFAULT 'gut-scan'`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "amrUrl" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "amrUrl"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP CONSTRAINT "DF_ac4d1c1d0d0bb14b7d20b244f5f"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "kitType"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "amrUrl"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP CONSTRAINT "DF_4ea45f9f932c7c176a2cba689be"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "kitType"`);
    }

}
