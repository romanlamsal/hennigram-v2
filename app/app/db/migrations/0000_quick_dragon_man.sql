CREATE SCHEMA "hennigram";
--> statement-breakpoint
CREATE TABLE "hennigram"."posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"ownerEmail" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"imageIds" text[] DEFAULT '{}' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
