import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726676793452 implements MigrationInterface {
    name = 'Migration1726676793452'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "registrationStatus" varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "registrationStatus" varchar(255)`);
    }

}
