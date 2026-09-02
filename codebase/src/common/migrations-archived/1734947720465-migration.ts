import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1734947720465 implements MigrationInterface {
    name = 'Migration1734947720465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-kits" ADD "registrationStatus" varchar(255) NOT NULL CONSTRAINT "DF_e994736567ed598203482a2702e" DEFAULT 'no'`);
        await queryRunner.query(`ALTER TABLE "order-kits" ADD "registeredBy" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-kits" DROP COLUMN "registeredBy"`);
        await queryRunner.query(`ALTER TABLE "order-kits" DROP CONSTRAINT "DF_e994736567ed598203482a2702e"`);
        await queryRunner.query(`ALTER TABLE "order-kits" DROP COLUMN "registrationStatus"`);
    }

}
