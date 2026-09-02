import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755779581094 implements MigrationInterface {
    name = 'Migration1755779581094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD "userId" uniqueidentifier NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP CONSTRAINT "DF_d9f08fe93e623b0ebf557d3f7f7"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD "createdAt" datetime NOT NULL CONSTRAINT "DF_d9f08fe93e623b0ebf557d3f7f7" DEFAULT GETUTCDATE()`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP CONSTRAINT "DF_170506889d9d09c4939285fbb6c"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD "updatedAt" datetime NOT NULL CONSTRAINT "DF_170506889d9d09c4939285fbb6c" DEFAULT GETUTCDATE()`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD CONSTRAINT "FK_5b534069c56790acd59665798c3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP CONSTRAINT "FK_5b534069c56790acd59665798c3"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP CONSTRAINT "DF_170506889d9d09c4939285fbb6c"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD "updatedAt" datetime2 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD CONSTRAINT "DF_170506889d9d09c4939285fbb6c" DEFAULT getdate() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP CONSTRAINT "DF_d9f08fe93e623b0ebf557d3f7f7"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD "createdAt" datetime2 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD CONSTRAINT "DF_d9f08fe93e623b0ebf557d3f7f7" DEFAULT getdate() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP COLUMN "userId"`);
    }

}
