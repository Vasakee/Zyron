import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1768745580543 implements MigrationInterface {
    name = 'Migration1768745580543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "provider_invites" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_c81353d74a526e234ea39531837" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_4f546432f3cf383bab9a5ab213b" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_55bab8326e850e02dd1c90d675f" DEFAULT GETUTCDATE(), "providerId" uniqueidentifier NOT NULL, "email" varchar(255) NOT NULL, "firstName" varchar(255) NOT NULL, "lastName" varchar(255) NOT NULL, "tokenHash" varchar(255) NOT NULL, "expiresAt" datetime NOT NULL, "acceptedAt" datetime, "createdByUserId" uniqueidentifier, CONSTRAINT "PK_c81353d74a526e234ea39531837" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_91192fef3d7e15f42d8f1a5487" ON "provider_invites" ("providerId", "email") `);
        await queryRunner.query(`ALTER TABLE "provider_invites" ADD CONSTRAINT "FK_00218e5bbaab4f9b35c3ccda012" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "provider_invites" DROP CONSTRAINT "FK_00218e5bbaab4f9b35c3ccda012"`);
        await queryRunner.query(`DROP INDEX "IDX_91192fef3d7e15f42d8f1a5487" ON "provider_invites"`);
        await queryRunner.query(`DROP TABLE "provider_invites"`);
    }

}
