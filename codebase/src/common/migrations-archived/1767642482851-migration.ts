import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767642482851 implements MigrationInterface {
    name = 'Migration1767642482851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "health_information_dispatch_logs" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_401c6d59ff0f730b34827c4235e" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_cc09b28bbb127aebfbf1f7fe5dd" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_4e0b29da8a11b455a56b23e232a" DEFAULT GETUTCDATE(), "orderId" uniqueidentifier NOT NULL, "kitId" varchar(255) NOT NULL, "practitionerId" uniqueidentifier NOT NULL, "recipientEmail" varchar(255) NOT NULL, "registeredAt" datetime NOT NULL, "status" varchar(255) NOT NULL CONSTRAINT "DF_05e3194f5a45a9edb87ede09b26" DEFAULT 'PENDING', "sentAt" datetime, "attempts" int NOT NULL CONSTRAINT "DF_81a37709a2e71a50dd7eae85a13" DEFAULT 0, "lastError" text, CONSTRAINT "UQ_3ae7382bfa79c5666d7b67ac524" UNIQUE ("orderId", "kitId"), CONSTRAINT "PK_401c6d59ff0f730b34827c4235e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_33c9b5a25293d5a10a07e8bd1c" ON "health_information_dispatch_logs" ("orderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfd1172ef6edad0cf697b741ae" ON "health_information_dispatch_logs" ("status", "registeredAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_bfd1172ef6edad0cf697b741ae" ON "health_information_dispatch_logs"`);
        await queryRunner.query(`DROP INDEX "IDX_33c9b5a25293d5a10a07e8bd1c" ON "health_information_dispatch_logs"`);
        await queryRunner.query(`DROP TABLE "health_information_dispatch_logs"`);
    }

}
