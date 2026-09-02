import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755610956627 implements MigrationInterface {
    name = 'Migration1755610956627'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP CONSTRAINT "DF_e9e169be307620e4c8f59e615ef"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD CONSTRAINT "DF_e9e169be307620e4c8f59e615ef" DEFAULT 'processed' FOR "status"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP CONSTRAINT "DF_e9e169be307620e4c8f59e615ef"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD CONSTRAINT "DF_e9e169be307620e4c8f59e615ef" DEFAULT 'pending' FOR "status"`);
    }

}
