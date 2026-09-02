import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1757368593538 implements MigrationInterface {
    name = 'Migration1757368593538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customer_profiles" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_ece08ee55cbe707d9f870907727" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_d9f08fe93e623b0ebf557d3f7f7" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_170506889d9d09c4939285fbb6c" DEFAULT GETUTCDATE(), "userId" uniqueidentifier NOT NULL, "clientName" nvarchar(255) NOT NULL, "kitId" nvarchar(255) NOT NULL, "reportReleaseDate" datetime, "vaariAnalysisDate" datetime, "status" nvarchar(255) NOT NULL CONSTRAINT "DF_e9e169be307620e4c8f59e615ef" DEFAULT 'processed', CONSTRAINT "UQ_6b50633356899f3eec7a5d4d230" UNIQUE ("kitId"), CONSTRAINT "PK_ece08ee55cbe707d9f870907727" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vaari_usage_events" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_edf79d470faa36b19081b6ff60e" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_96ececf57efd6ed8a190a6b0103" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_603ae2c8be87ff7512a227e51df" DEFAULT GETUTCDATE(), "userId" uniqueidentifier NOT NULL, "kitId" nvarchar(255), CONSTRAINT "PK_edf79d470faa36b19081b6ff60e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_42697eef5bd619e568593330e4" ON "vaari_usage_events" ("userId", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "nci_msft_1_kit_BAA0E6FB9B6C67E922CCF112ED6BB441" ON "kit" ("userId", "createdAt", "dateOfSampleCollection", "dateReceivedByLab", "fastQUrl", "healthInfoCompleted", "kitNumber", "kitType", "lockStatus", "pdfUrl", "resultsAvailable", "status", "submitted", "updatedAt") `);
        await queryRunner.query(`ALTER TABLE "customer_profiles" ADD CONSTRAINT "FK_5b534069c56790acd59665798c3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vaari_usage_events" ADD CONSTRAINT "FK_ab6e54ec4c92a0807eeddb4f366" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vaari_usage_events" DROP CONSTRAINT "FK_ab6e54ec4c92a0807eeddb4f366"`);
        await queryRunner.query(`ALTER TABLE "customer_profiles" DROP CONSTRAINT "FK_5b534069c56790acd59665798c3"`);
        await queryRunner.query(`DROP INDEX "IDX_42697eef5bd619e568593330e4" ON "vaari_usage_events"`);
        await queryRunner.query(`DROP TABLE "vaari_usage_events"`);
        await queryRunner.query(`DROP TABLE "customer_profiles"`);
        await queryRunner.query(`CREATE INDEX "nci_msft_1_kit_BAA0E6FB9B6C67E922CCF112ED6BB441" ON "kit" ("userId", "amrUrl", "createdAt", "dateOfSampleCollection", "dateReceivedByLab", "fastQUrl", "healthInfoCompleted", "kitNumber", "kitType", "lockStatus", "pdfUrl", "resultsAvailable", "status", "submitted", "summaryUrl", "taxonomyUrl", "updatedAt") `);
    }

}
