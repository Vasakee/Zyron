import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1717170722666 implements MigrationInterface {
    name = 'Migration1717170722666'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kit" DROP CONSTRAINT "FK_455778acf15d799f32d6a412efb"`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" DROP CONSTRAINT "FK_fd178f1397ff3133fee8f8faa66"`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" DROP CONSTRAINT "FK_1c5829aea2d91923802c4b39fce"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP CONSTRAINT "FK_bc5f62d07c0f5ac1e1197cbf366"`);
        await queryRunner.query(`ALTER TABLE "support" DROP CONSTRAINT "FK_0768a9a514d90be0f9d00fd8036"`);
        await queryRunner.query(`ALTER TABLE "external_practitioner" DROP CONSTRAINT "FK_7f73b8dfc239d61edd801306b12"`);
        await queryRunner.query(`ALTER TABLE "family-kits" DROP CONSTRAINT "FK_00b58a6c5985aa5c8f780d04d81"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD CONSTRAINT "FK_455778acf15d799f32d6a412efb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" ADD CONSTRAINT "FK_1c5829aea2d91923802c4b39fce" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" ADD CONSTRAINT "FK_fd178f1397ff3133fee8f8faa66" FOREIGN KEY ("practitionerId") REFERENCES "practitioner"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD CONSTRAINT "FK_bc5f62d07c0f5ac1e1197cbf366" FOREIGN KEY ("userId") REFERENCES "practitioner"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "support" ADD CONSTRAINT "FK_0768a9a514d90be0f9d00fd8036" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "external_practitioner" ADD CONSTRAINT "FK_7f73b8dfc239d61edd801306b12" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "family-kits" ADD CONSTRAINT "FK_00b58a6c5985aa5c8f780d04d81" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family-kits" DROP CONSTRAINT "FK_00b58a6c5985aa5c8f780d04d81"`);
        await queryRunner.query(`ALTER TABLE "external_practitioner" DROP CONSTRAINT "FK_7f73b8dfc239d61edd801306b12"`);
        await queryRunner.query(`ALTER TABLE "support" DROP CONSTRAINT "FK_0768a9a514d90be0f9d00fd8036"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP CONSTRAINT "FK_bc5f62d07c0f5ac1e1197cbf366"`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" DROP CONSTRAINT "FK_fd178f1397ff3133fee8f8faa66"`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" DROP CONSTRAINT "FK_1c5829aea2d91923802c4b39fce"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP CONSTRAINT "FK_455778acf15d799f32d6a412efb"`);
        await queryRunner.query(`ALTER TABLE "family-kits" ADD CONSTRAINT "FK_00b58a6c5985aa5c8f780d04d81" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "external_practitioner" ADD CONSTRAINT "FK_7f73b8dfc239d61edd801306b12" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "support" ADD CONSTRAINT "FK_0768a9a514d90be0f9d00fd8036" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD CONSTRAINT "FK_bc5f62d07c0f5ac1e1197cbf366" FOREIGN KEY ("userId") REFERENCES "practitioner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" ADD CONSTRAINT "FK_1c5829aea2d91923802c4b39fce" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" ADD CONSTRAINT "FK_fd178f1397ff3133fee8f8faa66" FOREIGN KEY ("practitionerId") REFERENCES "practitioner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kit" ADD CONSTRAINT "FK_455778acf15d799f32d6a412efb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
