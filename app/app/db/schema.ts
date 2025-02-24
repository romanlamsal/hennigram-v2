import { PgSchema, serial, text, timestamp } from "drizzle-orm/pg-core"

export const schema = new PgSchema("hennigram")

export const PostsTable = schema.table("posts", {
    id: serial("id").primaryKey(),

    title: text("title").notNull().default(""),
    description: text("description").notNull().default(""),
    imageIds: text("imageIds").array().notNull().default([]),

    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt")
        .notNull()
        .$onUpdate(() => new Date()),
})
