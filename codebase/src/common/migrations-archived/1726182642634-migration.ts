import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726182642634 implements MigrationInterface {
    name = 'Migration1726182642634'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "registrationStatus" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "kitId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "registeredBy" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shippingDate" datetime`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "trackingNumber" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "trackingNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shippingDate"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "registeredBy"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "kitId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "registrationStatus"`);
    }

}
