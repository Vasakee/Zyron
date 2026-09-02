import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1737146087567 implements MigrationInterface {
    name = 'Migration1737146087567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transfer-logs" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_a564385d179c07d56b63c2f73c0" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_481f9c149872cd34f627875377c" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_27ef3cfed5fd81e38aa2861801b" DEFAULT GETUTCDATE(), "userId" uniqueidentifier, "oldEmail" varchar(255) NOT NULL, "newEmail" varchar(255) NOT NULL, "oldToken" varchar(255), "newToken" varchar(255), "status" varchar(255) NOT NULL CONSTRAINT "DF_ce3f7d702026aecb16917fb80c8" DEFAULT 'pending', "newTokenExpiresAt" bigint, "oldTokenExpiresAt" bigint, CONSTRAINT "PK_a564385d179c07d56b63c2f73c0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transfer-logs" ADD CONSTRAINT "FK_069cd084f5764f97c47cad90591" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfer-logs" DROP CONSTRAINT "FK_069cd084f5764f97c47cad90591"`);
        await queryRunner.query(`DROP TABLE "transfer-logs"`);
    }

}
