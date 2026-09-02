import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1758629998210 implements MigrationInterface {
    name = 'Migration1758629998210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "stripeInvoiceId"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "stripeInvoiceUrl"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "stripeInvoiceStatus"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "stripeInvoicePdf"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP CONSTRAINT "DF_a7b54672ecf4e34126602fefb6d"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP COLUMN "amountSubtotal"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP CONSTRAINT "DF_cbdca64f07858b441aa54ef0676"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP COLUMN "amountDiscount"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP CONSTRAINT "DF_39c7c6cfed2796eca81763e9e39"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP COLUMN "amountTax"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP CONSTRAINT "DF_33f65e9917a1da0134d8e6f5cb1"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP COLUMN "amountTotal"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "invoiceId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "invoiceUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "invoiceStatus" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "invoicePdf" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "failureReason" nvarchar(max)`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD "unitAmount" bigint NOT NULL CONSTRAINT "DF_85fb874cefb90cc24a7d11f1a49" DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP CONSTRAINT "DF_85fb874cefb90cc24a7d11f1a49"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP COLUMN "unitAmount"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "failureReason"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "invoicePdf"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "invoiceStatus"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "invoiceUrl"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" DROP COLUMN "invoiceId"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD "amountTotal" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD CONSTRAINT "DF_33f65e9917a1da0134d8e6f5cb1" DEFAULT 0 FOR "amountTotal"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD "amountTax" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD CONSTRAINT "DF_39c7c6cfed2796eca81763e9e39" DEFAULT 0 FOR "amountTax"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD "amountDiscount" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD CONSTRAINT "DF_cbdca64f07858b441aa54ef0676" DEFAULT 0 FOR "amountDiscount"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD "amountSubtotal" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD CONSTRAINT "DF_a7b54672ecf4e34126602fefb6d" DEFAULT 0 FOR "amountSubtotal"`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "stripeInvoicePdf" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "stripeInvoiceStatus" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "stripeInvoiceUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ADD "stripeInvoiceId" varchar(255)`);
    }

}
