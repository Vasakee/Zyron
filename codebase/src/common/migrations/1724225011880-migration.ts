import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1724225011880 implements MigrationInterface {
    name = 'Migration1724225011880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "feedback" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_8389f9e087a57689cd5be8b2b13" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_59a7946f56cddfd6f80fafda48e" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_302cb56f520a412a17fe1b85529" DEFAULT GETUTCDATE(), "sessionId" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "referenceEmail" varchar(255), "awarenessChannel" varchar(255), "name" varchar(255) NOT NULL, "satisfaction" int, CONSTRAINT "UQ_f1f85e7ceeea8bb5658be8ff0ac" UNIQUE ("sessionId"), CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "feedback"`);
    }
}
