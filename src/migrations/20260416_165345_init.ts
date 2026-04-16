import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_resumes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resumes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_references_contact_methods_type" AS ENUM('phone', 'email');
  CREATE TYPE "public"."enum_job_applications_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__job_applications_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "applicants_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );

  CREATE TABLE "applicants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar,
  	"name_first_name" varchar,
  	"name_last_name" varchar,
  	"location_street" varchar,
  	"location_city" varchar,
  	"location_state" varchar,
  	"location_postal_code" varchar,
  	"location_country" varchar,
  	"phone" varchar,
  	"email" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "resumes_skill_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"category" varchar
  );

  CREATE TABLE "resumes_experience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"job_title" varchar,
  	"company" varchar,
  	"description" jsonb,
  	"start_date" timestamp(3) with time zone,
  	"current" boolean,
  	"end_date" timestamp(3) with time zone,
  	"location_street" varchar,
  	"location_city" varchar,
  	"location_state" varchar,
  	"location_postal_code" varchar,
  	"location_country" varchar
  );

  CREATE TABLE "resumes_education" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"school" varchar,
  	"degree" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone
  );

  CREATE TABLE "resumes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"applicant_id" integer,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_resumes_status" DEFAULT 'draft'
  );

  CREATE TABLE "resumes_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );

  CREATE TABLE "resumes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"references_id" integer
  );

  CREATE TABLE "_resumes_v_version_skill_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" varchar,
  	"_uuid" varchar
  );

  CREATE TABLE "_resumes_v_version_experience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"job_title" varchar,
  	"company" varchar,
  	"description" jsonb,
  	"start_date" timestamp(3) with time zone,
  	"current" boolean,
  	"end_date" timestamp(3) with time zone,
  	"location_street" varchar,
  	"location_city" varchar,
  	"location_state" varchar,
  	"location_postal_code" varchar,
  	"location_country" varchar,
  	"_uuid" varchar
  );

  CREATE TABLE "_resumes_v_version_education" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"school" varchar,
  	"degree" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"_uuid" varchar
  );

  CREATE TABLE "_resumes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_applicant_id" integer,
  	"version_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__resumes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );

  CREATE TABLE "_resumes_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );

  CREATE TABLE "_resumes_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"references_id" integer
  );

  CREATE TABLE "references_contact_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_references_contact_methods_type",
  	"email" varchar
  );

  CREATE TABLE "references" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"company" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "job_applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"job_posting_url" varchar,
  	"job_title" varchar,
  	"company" varchar,
  	"location_street" varchar,
  	"location_city" varchar,
  	"location_state" varchar,
  	"location_postal_code" varchar,
  	"location_country" varchar,
  	"applicant_id" integer,
  	"resume_id" integer,
  	"cover_letter" jsonb,
  	"submitted_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_job_applications_status" DEFAULT 'draft'
  );

  CREATE TABLE "_job_applications_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_job_posting_url" varchar,
  	"version_job_title" varchar,
  	"version_company" varchar,
  	"version_location_street" varchar,
  	"version_location_city" varchar,
  	"version_location_state" varchar,
  	"version_location_postal_code" varchar,
  	"version_location_country" varchar,
  	"version_applicant_id" integer,
  	"version_resume_id" integer,
  	"version_cover_letter" jsonb,
  	"version_submitted_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__job_applications_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );

  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );

  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"applicants_id" integer,
  	"resumes_id" integer,
  	"references_id" integer,
  	"job_applications_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );

  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );

  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "applicants_social_links" ADD CONSTRAINT "applicants_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resumes_skill_sections" ADD CONSTRAINT "resumes_skill_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resumes_experience" ADD CONSTRAINT "resumes_experience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resumes_education" ADD CONSTRAINT "resumes_education_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resumes" ADD CONSTRAINT "resumes_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resumes_texts" ADD CONSTRAINT "resumes_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resumes_rels" ADD CONSTRAINT "resumes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resumes_rels" ADD CONSTRAINT "resumes_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resumes_v_version_skill_sections" ADD CONSTRAINT "_resumes_v_version_skill_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resumes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resumes_v_version_experience" ADD CONSTRAINT "_resumes_v_version_experience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resumes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resumes_v_version_education" ADD CONSTRAINT "_resumes_v_version_education_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resumes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resumes_v" ADD CONSTRAINT "_resumes_v_parent_id_resumes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resumes_v" ADD CONSTRAINT "_resumes_v_version_applicant_id_applicants_id_fk" FOREIGN KEY ("version_applicant_id") REFERENCES "public"."applicants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resumes_v_texts" ADD CONSTRAINT "_resumes_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_resumes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resumes_v_rels" ADD CONSTRAINT "_resumes_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_resumes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resumes_v_rels" ADD CONSTRAINT "_resumes_v_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "references_contact_methods" ADD CONSTRAINT "references_contact_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_job_applications_v" ADD CONSTRAINT "_job_applications_v_parent_id_job_applications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."job_applications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_job_applications_v" ADD CONSTRAINT "_job_applications_v_version_applicant_id_applicants_id_fk" FOREIGN KEY ("version_applicant_id") REFERENCES "public"."applicants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_job_applications_v" ADD CONSTRAINT "_job_applications_v_version_resume_id_resumes_id_fk" FOREIGN KEY ("version_resume_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_applicants_fk" FOREIGN KEY ("applicants_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resumes_fk" FOREIGN KEY ("resumes_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_job_applications_fk" FOREIGN KEY ("job_applications_id") REFERENCES "public"."job_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "applicants_social_links_order_idx" ON "applicants_social_links" USING btree ("_order");
  CREATE INDEX "applicants_social_links_parent_id_idx" ON "applicants_social_links" USING btree ("_parent_id");
  CREATE INDEX "applicants_updated_at_idx" ON "applicants" USING btree ("updated_at");
  CREATE INDEX "applicants_created_at_idx" ON "applicants" USING btree ("created_at");
  CREATE INDEX "resumes_skill_sections_order_idx" ON "resumes_skill_sections" USING btree ("_order");
  CREATE INDEX "resumes_skill_sections_parent_id_idx" ON "resumes_skill_sections" USING btree ("_parent_id");
  CREATE INDEX "resumes_experience_order_idx" ON "resumes_experience" USING btree ("_order");
  CREATE INDEX "resumes_experience_parent_id_idx" ON "resumes_experience" USING btree ("_parent_id");
  CREATE INDEX "resumes_education_order_idx" ON "resumes_education" USING btree ("_order");
  CREATE INDEX "resumes_education_parent_id_idx" ON "resumes_education" USING btree ("_parent_id");
  CREATE INDEX "resumes_applicant_idx" ON "resumes" USING btree ("applicant_id");
  CREATE INDEX "resumes_updated_at_idx" ON "resumes" USING btree ("updated_at");
  CREATE INDEX "resumes_created_at_idx" ON "resumes" USING btree ("created_at");
  CREATE INDEX "resumes__status_idx" ON "resumes" USING btree ("_status");
  CREATE INDEX "resumes_texts_order_parent" ON "resumes_texts" USING btree ("order","parent_id");
  CREATE INDEX "resumes_rels_order_idx" ON "resumes_rels" USING btree ("order");
  CREATE INDEX "resumes_rels_parent_idx" ON "resumes_rels" USING btree ("parent_id");
  CREATE INDEX "resumes_rels_path_idx" ON "resumes_rels" USING btree ("path");
  CREATE INDEX "resumes_rels_references_id_idx" ON "resumes_rels" USING btree ("references_id");
  CREATE INDEX "_resumes_v_version_skill_sections_order_idx" ON "_resumes_v_version_skill_sections" USING btree ("_order");
  CREATE INDEX "_resumes_v_version_skill_sections_parent_id_idx" ON "_resumes_v_version_skill_sections" USING btree ("_parent_id");
  CREATE INDEX "_resumes_v_version_experience_order_idx" ON "_resumes_v_version_experience" USING btree ("_order");
  CREATE INDEX "_resumes_v_version_experience_parent_id_idx" ON "_resumes_v_version_experience" USING btree ("_parent_id");
  CREATE INDEX "_resumes_v_version_education_order_idx" ON "_resumes_v_version_education" USING btree ("_order");
  CREATE INDEX "_resumes_v_version_education_parent_id_idx" ON "_resumes_v_version_education" USING btree ("_parent_id");
  CREATE INDEX "_resumes_v_parent_idx" ON "_resumes_v" USING btree ("parent_id");
  CREATE INDEX "_resumes_v_version_version_applicant_idx" ON "_resumes_v" USING btree ("version_applicant_id");
  CREATE INDEX "_resumes_v_version_version_updated_at_idx" ON "_resumes_v" USING btree ("version_updated_at");
  CREATE INDEX "_resumes_v_version_version_created_at_idx" ON "_resumes_v" USING btree ("version_created_at");
  CREATE INDEX "_resumes_v_version_version__status_idx" ON "_resumes_v" USING btree ("version__status");
  CREATE INDEX "_resumes_v_created_at_idx" ON "_resumes_v" USING btree ("created_at");
  CREATE INDEX "_resumes_v_updated_at_idx" ON "_resumes_v" USING btree ("updated_at");
  CREATE INDEX "_resumes_v_latest_idx" ON "_resumes_v" USING btree ("latest");
  CREATE INDEX "_resumes_v_texts_order_parent" ON "_resumes_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_resumes_v_rels_order_idx" ON "_resumes_v_rels" USING btree ("order");
  CREATE INDEX "_resumes_v_rels_parent_idx" ON "_resumes_v_rels" USING btree ("parent_id");
  CREATE INDEX "_resumes_v_rels_path_idx" ON "_resumes_v_rels" USING btree ("path");
  CREATE INDEX "_resumes_v_rels_references_id_idx" ON "_resumes_v_rels" USING btree ("references_id");
  CREATE INDEX "references_contact_methods_order_idx" ON "references_contact_methods" USING btree ("_order");
  CREATE INDEX "references_contact_methods_parent_id_idx" ON "references_contact_methods" USING btree ("_parent_id");
  CREATE INDEX "references_updated_at_idx" ON "references" USING btree ("updated_at");
  CREATE INDEX "references_created_at_idx" ON "references" USING btree ("created_at");
  CREATE INDEX "job_applications_applicant_idx" ON "job_applications" USING btree ("applicant_id");
  CREATE INDEX "job_applications_resume_idx" ON "job_applications" USING btree ("resume_id");
  CREATE INDEX "job_applications_updated_at_idx" ON "job_applications" USING btree ("updated_at");
  CREATE INDEX "job_applications_created_at_idx" ON "job_applications" USING btree ("created_at");
  CREATE INDEX "job_applications__status_idx" ON "job_applications" USING btree ("_status");
  CREATE INDEX "_job_applications_v_parent_idx" ON "_job_applications_v" USING btree ("parent_id");
  CREATE INDEX "_job_applications_v_version_version_applicant_idx" ON "_job_applications_v" USING btree ("version_applicant_id");
  CREATE INDEX "_job_applications_v_version_version_resume_idx" ON "_job_applications_v" USING btree ("version_resume_id");
  CREATE INDEX "_job_applications_v_version_version_updated_at_idx" ON "_job_applications_v" USING btree ("version_updated_at");
  CREATE INDEX "_job_applications_v_version_version_created_at_idx" ON "_job_applications_v" USING btree ("version_created_at");
  CREATE INDEX "_job_applications_v_version_version__status_idx" ON "_job_applications_v" USING btree ("version__status");
  CREATE INDEX "_job_applications_v_created_at_idx" ON "_job_applications_v" USING btree ("created_at");
  CREATE INDEX "_job_applications_v_updated_at_idx" ON "_job_applications_v" USING btree ("updated_at");
  CREATE INDEX "_job_applications_v_latest_idx" ON "_job_applications_v" USING btree ("latest");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_applicants_id_idx" ON "payload_locked_documents_rels" USING btree ("applicants_id");
  CREATE INDEX "payload_locked_documents_rels_resumes_id_idx" ON "payload_locked_documents_rels" USING btree ("resumes_id");
  CREATE INDEX "payload_locked_documents_rels_references_id_idx" ON "payload_locked_documents_rels" USING btree ("references_id");
  CREATE INDEX "payload_locked_documents_rels_job_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("job_applications_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "applicants_social_links" CASCADE;
  DROP TABLE "applicants" CASCADE;
  DROP TABLE "resumes_skill_sections" CASCADE;
  DROP TABLE "resumes_experience" CASCADE;
  DROP TABLE "resumes_education" CASCADE;
  DROP TABLE "resumes" CASCADE;
  DROP TABLE "resumes_texts" CASCADE;
  DROP TABLE "resumes_rels" CASCADE;
  DROP TABLE "_resumes_v_version_skill_sections" CASCADE;
  DROP TABLE "_resumes_v_version_experience" CASCADE;
  DROP TABLE "_resumes_v_version_education" CASCADE;
  DROP TABLE "_resumes_v" CASCADE;
  DROP TABLE "_resumes_v_texts" CASCADE;
  DROP TABLE "_resumes_v_rels" CASCADE;
  DROP TABLE "references_contact_methods" CASCADE;
  DROP TABLE "references" CASCADE;
  DROP TABLE "job_applications" CASCADE;
  DROP TABLE "_job_applications_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_resumes_status";
  DROP TYPE "public"."enum__resumes_v_version_status";
  DROP TYPE "public"."enum_references_contact_methods_type";
  DROP TYPE "public"."enum_job_applications_status";
  DROP TYPE "public"."enum__job_applications_v_version_status";`);
}
