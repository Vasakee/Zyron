import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1738941483630 implements MigrationInterface {
    name = 'Migration1738941483630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment-methods" ADD "isDefault" bit NOT NULL CONSTRAINT "DF_21f8ded2743573f3582d6fce46d" DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment-methods" DROP CONSTRAINT "DF_21f8ded2743573f3582d6fce46d"`);
        await queryRunner.query(`ALTER TABLE "payment-methods" DROP COLUMN "isDefault"`);
    }

}
