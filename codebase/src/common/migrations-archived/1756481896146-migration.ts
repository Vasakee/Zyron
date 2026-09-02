import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1756481896146 implements MigrationInterface {
    name = 'Migration1756481896146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vaari_usage_events" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_edf79d470faa36b19081b6ff60e" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_96ececf57efd6ed8a190a6b0103" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_603ae2c8be87ff7512a227e51df" DEFAULT GETUTCDATE(), "userId" uniqueidentifier NOT NULL, "kitId" nvarchar(255), CONSTRAINT "PK_edf79d470faa36b19081b6ff60e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_42697eef5bd619e568593330e4" ON "vaari_usage_events" ("userId", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "vaari_usage_events" ADD CONSTRAINT "FK_ab6e54ec4c92a0807eeddb4f366" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vaari_usage_events" DROP CONSTRAINT "FK_ab6e54ec4c92a0807eeddb4f366"`);
        await queryRunner.query(`DROP INDEX "IDX_42697eef5bd619e568593330e4" ON "vaari_usage_events"`);
        await queryRunner.query(`DROP TABLE "vaari_usage_events"`);
    }

}
