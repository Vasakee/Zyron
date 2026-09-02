import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1757607954809 implements MigrationInterface {
    name = 'Migration1757607954809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD "lastUpdatedById" uniqueidentifier`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD "createdByRole" nvarchar(255) NOT NULL CONSTRAINT "DF_3d3d6286574247a13fd9dbcebd0" DEFAULT 'practitioner'`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD "lastUpdatedByRole" nvarchar(255) NOT NULL CONSTRAINT "DF_06fabd63a6c5c268a2770091f7d" DEFAULT 'practitioner'`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD CONSTRAINT "FK_21867e00c7da010d06cf51ef961" FOREIGN KEY ("lastUpdatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP CONSTRAINT "FK_21867e00c7da010d06cf51ef961"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP CONSTRAINT "DF_06fabd63a6c5c268a2770091f7d"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP COLUMN "lastUpdatedByRole"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP CONSTRAINT "DF_3d3d6286574247a13fd9dbcebd0"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP COLUMN "createdByRole"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP COLUMN "lastUpdatedById"`);
    }

}
