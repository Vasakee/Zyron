import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726674953189 implements MigrationInterface {
    name = 'Migration1726674953189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update existing rows with null registrationStatus to 'no'
        await queryRunner.query(`UPDATE "orders" SET "registrationStatus" = 'no' WHERE "registrationStatus" IS NULL`);
        
        // Drop the existing default constraint
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_d013a1f83cb0e12fa6a10ba03f1"`);
        
        // Add the new default constraint for registrationStatus
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "DF_d013a1f83cb0e12fa6a10ba03f1" DEFAULT 'no' FOR "registrationStatus"`);
        
        // Make the registrationStatus column NOT NULL
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "registrationStatus" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the NOT NULL constraint
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "registrationStatus" DROP NOT NULL`);
        
        // Drop the current default constraint
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_d013a1f83cb0e12fa6a10ba03f1"`);
        
        // Re-add the original default constraint
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "DF_d013a1f83cb0e12fa6a10ba03f1" DEFAULT 'No' FOR "registrationStatus"`);
    }
}
