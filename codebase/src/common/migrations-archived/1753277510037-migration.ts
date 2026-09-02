import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1753277510037 implements MigrationInterface {
    name = 'Migration1753277510037'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "taxonomyUrl"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "taxonomyUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "amrUrl"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "amrUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "taxonomyUrl"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "taxonomyUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "amrUrl"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "amrUrl" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "amrUrl"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "amrUrl" nvarchar(MAX)`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "taxonomyUrl"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "taxonomyUrl" nvarchar(MAX)`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "amrUrl"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "amrUrl" nvarchar(MAX)`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "taxonomyUrl"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "taxonomyUrl" nvarchar(MAX)`);
    }

}
