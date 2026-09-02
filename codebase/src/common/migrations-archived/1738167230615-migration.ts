import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1738167230615 implements MigrationInterface {
    name = 'Migration1738167230615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment-methods" ADD "customerId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "lastName" varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "lastName" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment-methods" DROP COLUMN "customerId"`);
    }

}
