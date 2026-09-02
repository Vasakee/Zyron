import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765799000000 implements MigrationInterface {
    name = 'Migration1765799000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "kit_replacement_requests" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_kit_repl_id" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_kit_repl_createdAt" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_kit_repl_updatedAt" DEFAULT GETUTCDATE(), "referenceId" varchar(100) NOT NULL, "targetType" varchar(30) NOT NULL, "practitionerId" uniqueidentifier, "firstName" varchar(100) NOT NULL, "lastName" varchar(100) NOT NULL, "email" varchar(255) NOT NULL, "kitType" varchar(50) NOT NULL, "currency" varchar(10) NOT NULL, "quantity" int NOT NULL, "country" varchar(50) NOT NULL, "addressLineOne" varchar(255) NOT NULL, "addressLineTwo" varchar(255), "city" varchar(100) NOT NULL, "state" varchar(100) NOT NULL, "postalCode" varchar(20) NOT NULL, "status" varchar(30) NOT NULL, "paymentUrl" nvarchar(max), "paymentSessionId" varchar(255), "createdByAdminId" uniqueidentifier NOT NULL, CONSTRAINT "PK_kit_repl_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_kit_repl_referenceId" ON "kit_replacement_requests" ("referenceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_kit_repl_practitioner" ON "kit_replacement_requests" ("practitionerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_kit_repl_status" ON "kit_replacement_requests" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_kit_repl_status" ON "kit_replacement_requests"`);
        await queryRunner.query(`DROP INDEX "IDX_kit_repl_practitioner" ON "kit_replacement_requests"`);
        await queryRunner.query(`DROP INDEX "UQ_kit_repl_referenceId" ON "kit_replacement_requests"`);
        await queryRunner.query(`DROP TABLE "kit_replacement_requests"`);
    }

}
