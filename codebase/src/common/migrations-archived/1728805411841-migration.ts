import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1728805411841 implements MigrationInterface {
    name = 'Migration1728805411841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "expectedDeliveryDate" datetime`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "dateDelivered" datetime`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "delivered" varchar(255) NOT NULL CONSTRAINT "DF_b78ccdf54ff3773e3f7c2314135" DEFAULT 'no'`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "kitId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "shippingDate" datetime`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "trackingNumber" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "expectedDeliveryDate" datetime`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "dateDelivered" datetime`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "delivered" varchar(255) NOT NULL CONSTRAINT "DF_e69c52f5b62c8bd56d7a2418e6d" DEFAULT 'no'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shippings" DROP CONSTRAINT "DF_e69c52f5b62c8bd56d7a2418e6d"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "delivered"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "dateDelivered"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "expectedDeliveryDate"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "trackingNumber"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "shippingDate"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "kitId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_b78ccdf54ff3773e3f7c2314135"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "delivered"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "dateDelivered"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "expectedDeliveryDate"`);
    }

}
