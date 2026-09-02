import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1733478492210 implements MigrationInterface {
    name = 'Migration1733478492210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "order-kits" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_9e1892b5078ab33967a5d959d49" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_7f9af18b30457bdb8a601d25339" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_9699a3fedc616e7439545347185" DEFAULT GETUTCDATE(), "orderId" uniqueidentifier NOT NULL, "kitId" varchar(255) NOT NULL, CONSTRAINT "PK_9e1892b5078ab33967a5d959d49" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order-kits" ADD CONSTRAINT "FK_6fd4016f542a5ad44a15bef4c9b" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-kits" DROP CONSTRAINT "FK_6fd4016f542a5ad44a15bef4c9b"`);
        await queryRunner.query(`DROP TABLE "order-kits"`);
    }

}
