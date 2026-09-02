import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726163870903 implements MigrationInterface {
    name = 'Migration1726163870903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback" ADD "code" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD "source" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP COLUMN "code"`);
    }

}
