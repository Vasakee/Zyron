import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743062397111 implements MigrationInterface {
    name = 'Migration1743062397111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reminders" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_38715fec7f634b72c6cf7ea4893" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_e037d699f69eda1d6e366bf4eb4" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_2774334b4c84345d6a2afd0ed65" DEFAULT GETUTCDATE(), "slug" nvarchar(255) NOT NULL, "date" datetime NOT NULL, "name" varchar(255) NOT NULL, "status" varchar(255) CONSTRAINT CHK_523d9ad6f424db7ab289d337f8_ENUM CHECK(status IN ('pending','sent')) NOT NULL CONSTRAINT "DF_f1e2dfe3f1c1eb4814cafa0af8a" DEFAULT 'pending', CONSTRAINT "UQ_ed0bbc9f6a0bb6d1c3270bceb96" UNIQUE ("slug"), CONSTRAINT "PK_38715fec7f634b72c6cf7ea4893" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "reminders"`);
    }

}
