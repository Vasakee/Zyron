import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1727684806146 implements MigrationInterface {
    name = 'Migration1727684806146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "support-message" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_fe75c726478e5fbb707083d5184" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_fda13e81418d85601698b7f9e44" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_9d5b1ed39defbbd5223d9f88109" DEFAULT GETUTCDATE(), "userId" uniqueidentifier NOT NULL, "content" text NOT NULL, "supportId" uniqueidentifier NOT NULL, "sender" varchar(255) NOT NULL, CONSTRAINT "PK_fe75c726478e5fbb707083d5184" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "support" ADD "messageId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "support-message" ADD CONSTRAINT "FK_93b7466b22df5e3d8b26eff041b" FOREIGN KEY ("supportId") REFERENCES "support"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "support-message" ADD CONSTRAINT "FK_56ad27bb54beb49c06963114168" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support-message" DROP CONSTRAINT "FK_56ad27bb54beb49c06963114168"`);
        await queryRunner.query(`ALTER TABLE "support-message" DROP CONSTRAINT "FK_93b7466b22df5e3d8b26eff041b"`);
        await queryRunner.query(`ALTER TABLE "support" DROP COLUMN "messageId"`);
        await queryRunner.query(`DROP TABLE "support-message"`);
    }

}
