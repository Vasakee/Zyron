import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1757685620497 implements MigrationInterface {
    name = 'Migration1757685620497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "stripeSessionId" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "stripeSessionId"`);
    }

}
