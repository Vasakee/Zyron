import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateValidKitTable1716508956708 implements MigrationInterface {
    name = 'CreateValidKitTable1716508956708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_practitioner" DROP CONSTRAINT "FK_1c5829aea2d91923802c4b39fce"`);
        await queryRunner.query(`ALTER TABLE "external_practitioner" DROP CONSTRAINT "FK_7f73b8dfc239d61edd801306b12"`);
        await queryRunner.query(`CREATE TABLE "valid-kit" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_62a91d741d1a440b6c1dc5a4661" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_5e2ba3630171b38cf3f6001e54b" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_b0deea33848eb7758803afd139c" DEFAULT GETUTCDATE(), "status" varchar(255) NOT NULL, "expiryDate" varchar(255), "sampleType" varchar(255), "sequenceType" varchar(255), "kitId" varchar(255) NOT NULL, CONSTRAINT "UQ_514db31d091e84aef0bbb8be67e" UNIQUE ("kitId"), CONSTRAINT "PK_62a91d741d1a440b6c1dc5a4661" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" ADD CONSTRAINT "FK_1c5829aea2d91923802c4b39fce" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "external_practitioner" ADD CONSTRAINT "FK_7f73b8dfc239d61edd801306b12" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "external_practitioner" DROP CONSTRAINT "FK_7f73b8dfc239d61edd801306b12"`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" DROP CONSTRAINT "FK_1c5829aea2d91923802c4b39fce"`);
        await queryRunner.query(`DROP TABLE "valid-kit"`);
        await queryRunner.query(`ALTER TABLE "external_practitioner" ADD CONSTRAINT "FK_7f73b8dfc239d61edd801306b12" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" ADD CONSTRAINT "FK_1c5829aea2d91923802c4b39fce" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
