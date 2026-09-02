import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1753283371858 implements MigrationInterface {
    name = 'Migration1753283371858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "contacts" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_b99cd40cfd66a99f1571f4f72e6" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_d85a678bac9a6dfaa3be9603fbe" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_da1db1562d51aafa425ba8baacf" DEFAULT GETUTCDATE(), "firstName" varchar(255) NOT NULL, "lastName" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "phone" varchar(255), "message" text NOT NULL, "fileUrl" varchar(255), CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "contacts"`);
    }

}
