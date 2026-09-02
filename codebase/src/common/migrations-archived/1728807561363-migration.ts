import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1728807561363 implements MigrationInterface {
    name = 'Migration1728807561363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shippings" ADD "country" varchar(255) NOT NULL CONSTRAINT "DF_3e87a8ad9a4c89fcd72cfdf1c88" DEFAULT 'string'`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "addressLineOne" varchar(255) NOT NULL CONSTRAINT "DF_c7057c17c5f3adf1765b5de9aa3" DEFAULT 'string'`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "addressLineTwo" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "city" varchar(255) NOT NULL CONSTRAINT "DF_29c6c2c7d202c36ccac51b0e1e2" DEFAULT 'string'`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "state" varchar(255) NOT NULL CONSTRAINT "DF_e59580204b2e1de68479d0e3109" DEFAULT 'string'`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "postalCode" varchar(255) NOT NULL CONSTRAINT "DF_68534d2cb4c14aa2740b12a5a55" DEFAULT 'string'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shippings" DROP CONSTRAINT "DF_68534d2cb4c14aa2740b12a5a55"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "postalCode"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP CONSTRAINT "DF_e59580204b2e1de68479d0e3109"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP CONSTRAINT "DF_29c6c2c7d202c36ccac51b0e1e2"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "addressLineTwo"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP CONSTRAINT "DF_c7057c17c5f3adf1765b5de9aa3"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "addressLineOne"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP CONSTRAINT "DF_3e87a8ad9a4c89fcd72cfdf1c88"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "country"`);
    }

}
