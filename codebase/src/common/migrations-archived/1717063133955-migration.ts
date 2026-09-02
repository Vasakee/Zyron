import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1717063133955 implements MigrationInterface {
    name = 'Migration1717063133955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "practitioner-kits" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_8b1732c7affd28be675b6aab147" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_3252a850db97956e07f61044756" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_1dc1710176c8ff9a1a2c877169e" DEFAULT GETUTCDATE(), "practitionerId" uniqueidentifier NOT NULL, "name" varchar(255) NOT NULL, "status" varchar(255) NOT NULL CONSTRAINT "DF_1762eddc17f7e3a2ab5b1e8b0c2" DEFAULT 'registered', "dateOfSampleCollection" datetime, "dateReceivedByLab" datetime, "resultsAvailable" datetime, "lockStatus" varchar(255), "pdfUrl" varchar(255), "taxonomyUrl" varchar(255), "summaryUrl" varchar(255), "fastQUrl" varchar(255), "kitNumber" varchar(255) NOT NULL, "userId" uniqueidentifier, CONSTRAINT "UQ_5de89d58b6776ebecbdd324f559" UNIQUE ("kitNumber"), CONSTRAINT "PK_8b1732c7affd28be675b6aab147" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "family-kits" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_fd95123afaa874512522f4fdcef" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_69d509a6c07e0f11947a9431210" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_f2ee864270562be22313f7674eb" DEFAULT GETUTCDATE(), "userId" uniqueidentifier NOT NULL, "name" varchar(255) NOT NULL, "status" varchar(255) NOT NULL CONSTRAINT "DF_241df7adfade3797ffe2a09cabc" DEFAULT 'registered', "dateOfSampleCollection" datetime, "dateReceivedByLab" datetime, "resultsAvailable" datetime, "lockStatus" varchar(255), "pdfUrl" varchar(255), "taxonomyUrl" varchar(255), "summaryUrl" varchar(255), "fastQUrl" varchar(255), "kitNumber" varchar(255) NOT NULL, CONSTRAINT "UQ_db1a400daa54e2943ddea074fcb" UNIQUE ("kitNumber"), CONSTRAINT "PK_fd95123afaa874512522f4fdcef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "pdf"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "taxonomy"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "summary"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP COLUMN "fastq"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "passwordUpdateStatus" varchar(255) NOT NULL CONSTRAINT "DF_7cac8b553f41d820482de7bb3f8" DEFAULT 'completed'`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD CONSTRAINT "FK_bc5f62d07c0f5ac1e1197cbf366" FOREIGN KEY ("userId") REFERENCES "practitioner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "family-kits" ADD CONSTRAINT "FK_00b58a6c5985aa5c8f780d04d81" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family-kits" DROP CONSTRAINT "FK_00b58a6c5985aa5c8f780d04d81"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP CONSTRAINT "FK_bc5f62d07c0f5ac1e1197cbf366"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "DF_7cac8b553f41d820482de7bb3f8"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "passwordUpdateStatus"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "fastq" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "summary" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "taxonomy" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "kit" ADD "pdf" varchar(255)`);
        await queryRunner.query(`DROP TABLE "family-kits"`);
        await queryRunner.query(`DROP TABLE "practitioner-kits"`);
    }

}
