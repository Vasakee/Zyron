import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1758919022391 implements MigrationInterface {
    name = 'Migration1758919022391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "invoiceNumber" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "invoiceNumber" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "invoiceNumber"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "invoiceNumber"`);
    }

}
