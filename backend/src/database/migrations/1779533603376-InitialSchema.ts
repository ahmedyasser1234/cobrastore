import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1779533603376 implements MigrationInterface {
    name = 'InitialSchema1779533603376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."store_staff_role_enum" AS ENUM('owner', 'manager', 'fulfillment')`);
        await queryRunner.query(`CREATE TABLE "store_staff" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "storeId" uuid NOT NULL, "userId" uuid NOT NULL, "role" "public"."store_staff_role_enum" NOT NULL DEFAULT 'manager', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_80029cafd3e9527fcc70a2823a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."ads_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "ads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "imageUrl" character varying, "targetUrl" character varying, "status" "public"."ads_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a7af7d1998037a97076f758fc23" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "store_staff" ADD CONSTRAINT "FK_ef7dd70aa9d4592908147e4bbab" FOREIGN KEY ("storeId") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store_staff" ADD CONSTRAINT "FK_ed9750a32047ed4f68921147c45" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store_staff" DROP CONSTRAINT "FK_ed9750a32047ed4f68921147c45"`);
        await queryRunner.query(`ALTER TABLE "store_staff" DROP CONSTRAINT "FK_ef7dd70aa9d4592908147e4bbab"`);
        await queryRunner.query(`DROP TABLE "ads"`);
        await queryRunner.query(`DROP TYPE "public"."ads_status_enum"`);
        await queryRunner.query(`DROP TABLE "store_staff"`);
        await queryRunner.query(`DROP TYPE "public"."store_staff_role_enum"`);
    }

}
