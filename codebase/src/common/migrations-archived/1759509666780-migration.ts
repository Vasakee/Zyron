import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1759509666780 implements MigrationInterface {
    name = 'Migration1759509666780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "firstName" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "email" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "email" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "firstName" varchar(255) NOT NULL`);
    }

}
