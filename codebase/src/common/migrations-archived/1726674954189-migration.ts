import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726674954189 implements MigrationInterface {
    name = 'Migration1726674954189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update existing rows with null registrationStatus to 'no'
        await queryRunner.query(`UPDATE "orders" SET "registrationStatus" = 'no' WHERE "registrationStatus" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }
}
