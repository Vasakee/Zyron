import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754034056185 implements MigrationInterface {
    name = 'Migration1754034056185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api-keys" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "taxonomyUrl"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "taxonomyUrl" nvarchar(max)`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "amrUrl"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "amrUrl" nvarchar(max)`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "taxonomyUrl"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "taxonomyUrl" nvarchar(max)`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "amrUrl"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "amrUrl" nvarchar(max)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "amrUrl"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "amrUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "taxonomyUrl"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "taxonomyUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "amrUrl"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "amrUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "taxonomyUrl"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "taxonomyUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "api-keys" ADD "username" varchar(255)`);
    }

}
