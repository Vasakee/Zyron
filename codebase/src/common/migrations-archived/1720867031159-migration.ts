import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1720867031159 implements MigrationInterface {
    name = 'Migration1720867031159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "stripeId" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "stripeId"`);
    }

}
