import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755604371411 implements MigrationInterface {
    name = 'Migration1755604371411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customer_profiles" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_ece08ee55cbe707d9f870907727" DEFAULT NEWSEQUENTIALID(), "clientName" nvarchar(255) NOT NULL, "kitId" nvarchar(255) NOT NULL, "reportReleaseDate" datetime, "vaariAnalysisDate" datetime, "status" nvarchar(255) NOT NULL CONSTRAINT "DF_e9e169be307620e4c8f59e615ef" DEFAULT 'pending', "createdAt" datetime2 NOT NULL CONSTRAINT "DF_d9f08fe93e623b0ebf557d3f7f7" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_170506889d9d09c4939285fbb6c" DEFAULT getdate(), CONSTRAINT "UQ_6b50633356899f3eec7a5d4d230" UNIQUE ("kitId"), CONSTRAINT "PK_ece08ee55cbe707d9f870907727" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "nci_msft_1_kit_BAA0E6FB9B6C67E922CCF112ED6BB441" ON "kit" ("userId", "createdAt", "dateOfSampleCollection", "dateReceivedByLab", "fastQUrl", "healthInfoCompleted", "kitNumber", "kitType", "lockStatus", "pdfUrl", "resultsAvailable", "status", "submitted", "updatedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "nci_msft_1_kit_BAA0E6FB9B6C67E922CCF112ED6BB441" ON "kit"`);
        await queryRunner.query(`DROP TABLE "customer_profiles"`);
    }

}
