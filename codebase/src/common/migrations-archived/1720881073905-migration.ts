import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1720881073905 implements MigrationInterface {
    name = 'Migration1720881073905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "addressLineTwo" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "addressLineTwo" varchar(255) NOT NULL`);
    }

}
