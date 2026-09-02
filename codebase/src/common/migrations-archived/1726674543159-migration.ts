import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726674543159 implements MigrationInterface {
    name = 'Migration1726674543159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "DF_d013a1f83cb0e12fa6a10ba03f1" DEFAULT 'No' FOR "registrationStatus"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_d013a1f83cb0e12fa6a10ba03f1"`);
    }

}
