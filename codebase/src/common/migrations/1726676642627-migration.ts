import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726676642627 implements MigrationInterface {
    name = 'Migration1726676642627'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "DF_d013a1f83cb0e12fa6a10ba03f1" DEFAULT 'no' FOR "registrationStatus"`);
        await queryRunner.query(`UPDATE "orders" SET "registrationStatus" = 'no' WHERE "registrationStatus" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_d013a1f83cb0e12fa6a10ba03f1"`);
    }

}
