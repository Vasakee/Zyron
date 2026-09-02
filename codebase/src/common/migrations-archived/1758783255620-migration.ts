import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1758783255620 implements MigrationInterface {
    name = 'Migration1758783255620'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD "clientName" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" ADD "clientEmail" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP COLUMN "clientEmail"`);
        await queryRunner.query(`ALTER TABLE "payment_statement_items" DROP COLUMN "clientName"`);
    }

}
