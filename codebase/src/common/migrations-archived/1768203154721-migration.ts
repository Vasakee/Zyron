import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1768203154721 implements MigrationInterface {
    name = 'Migration1768203154721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "provider_accounts" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_30803043b7efd4483786901ddc0" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_cb648a69fb6103971ed6dd1bec7" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_30163c2e742d89e4637be5a45ed" DEFAULT GETUTCDATE(), "providerId" uniqueidentifier NOT NULL, "userId" uniqueidentifier NOT NULL, "status" varchar(255) NOT NULL CONSTRAINT "DF_813451653fc6b863bd8c69a0a59" DEFAULT 'active', CONSTRAINT "PK_30803043b7efd4483786901ddc0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d17926d13b3fd5313c16cb9328" ON "provider_accounts" ("providerId", "userId") `);
        await queryRunner.query(`CREATE TABLE "providers" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_af13fc2ebf382fe0dad2e4793aa" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_8edb081dcbac9460095453b9655" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_8f930e01aef0d91e763137cb7a8" DEFAULT GETUTCDATE(), "name" varchar(255) NOT NULL, "clientId" varchar(255) NOT NULL, "kitTypes" ntext, "status" varchar(255) NOT NULL CONSTRAINT "DF_e0fc818fbf9f1beca06f05f3739" DEFAULT 'active', CONSTRAINT "UQ_d735474e539e674ba3702eddc44" UNIQUE ("name"), CONSTRAINT "UQ_3c064d93fdf5fffa8f3da2bc832" UNIQUE ("clientId"), CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "api-keys" ADD "clientSecretHash" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "api-keys" ADD "providerId" uniqueidentifier`);
        await queryRunner.query(`ALTER TABLE "api-keys" ADD "revokedAt" datetime`);
        await queryRunner.query(`ALTER TABLE "api-keys" ADD "lastRotatedAt" datetime`);
        await queryRunner.query(`ALTER TABLE "api-keys" ADD "createdByUserId" uniqueidentifier`);
        await queryRunner.query(`ALTER TABLE "api-keys" ALTER COLUMN "clientSecret" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "provider_accounts" ADD CONSTRAINT "FK_92042a16db4f50ccbab4b205b77" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "provider_accounts" ADD CONSTRAINT "FK_76e3df6ee6d128fff9955607ac5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api-keys" ADD CONSTRAINT "FK_f3097166a17a60bafb417a2daa2" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api-keys" DROP CONSTRAINT "FK_f3097166a17a60bafb417a2daa2"`);
        await queryRunner.query(`ALTER TABLE "provider_accounts" DROP CONSTRAINT "FK_76e3df6ee6d128fff9955607ac5"`);
        await queryRunner.query(`ALTER TABLE "provider_accounts" DROP CONSTRAINT "FK_92042a16db4f50ccbab4b205b77"`);
        await queryRunner.query(`ALTER TABLE "api-keys" ALTER COLUMN "clientSecret" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "api-keys" DROP COLUMN "createdByUserId"`);
        await queryRunner.query(`ALTER TABLE "api-keys" DROP COLUMN "lastRotatedAt"`);
        await queryRunner.query(`ALTER TABLE "api-keys" DROP COLUMN "revokedAt"`);
        await queryRunner.query(`ALTER TABLE "api-keys" DROP COLUMN "providerId"`);
        await queryRunner.query(`ALTER TABLE "api-keys" DROP COLUMN "clientSecretHash"`);
        await queryRunner.query(`DROP TABLE "providers"`);
        await queryRunner.query(`DROP INDEX "IDX_d17926d13b3fd5313c16cb9328" ON "provider_accounts"`);
        await queryRunner.query(`DROP TABLE "provider_accounts"`);
    }

}
