ALTER TABLE "chirps" ALTER COLUMN "body" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "hased_password" varchar(256) DEFAULT 'unset' NOT NULL;