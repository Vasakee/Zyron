import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1758589556864 implements MigrationInterface {
    name = 'Migration1758589556864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "stripeInvoiceUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "stripeInvoiceStatus" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "stripeInvoicePdf" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD CONSTRAINT "FK_bd210023bf3e7d139648a12babc" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP CONSTRAINT "FK_bd210023bf3e7d139648a12babc"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "stripeInvoicePdf"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "stripeInvoiceStatus"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "stripeInvoiceUrl"`);
    }

}
