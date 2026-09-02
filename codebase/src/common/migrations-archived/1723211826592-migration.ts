import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1723211826592 implements MigrationInterface {
    name = 'Migration1723211826592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "generated-kits" DROP COLUMN "qrCode"`);
        await queryRunner.query(`ALTER TABLE "generated-kits" ADD "qrCode" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "generated-kits" DROP COLUMN "qrCode"`);
        await queryRunner.query(`ALTER TABLE "generated-kits" ADD "qrCode" varchar(255) NOT NULL`);
    }

}
