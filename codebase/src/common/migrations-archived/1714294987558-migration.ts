import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1714294987558 implements MigrationInterface {
    name = 'Migration1714294987558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "dateOfSampleCollection"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "dateOfSampleCollection" datetime`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "dateReceivedByLab"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "dateReceivedByLab" datetime`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "resultsAvailable"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "resultsAvailable" datetime`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "resultsAvailable"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "resultsAvailable" date`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "dateReceivedByLab"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "dateReceivedByLab" date`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "dateOfSampleCollection"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "dateOfSampleCollection" date`);
    }

}
