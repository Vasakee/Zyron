import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1737374579873 implements MigrationInterface {
    name = 'Migration1737374579873'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "lastName" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "lastName" varchar(255) NOT NULL`);
    }

}
