import { asc, eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { db } from "~/db"
import { PostsTable } from "~/db/schema"

export const PostInsertSchema = createInsertSchema(PostsTable)

export const listPosts = async () =>
    db
        .select({
            id: PostsTable.id,
            title: PostsTable.title,
            description: PostsTable.description,
            imageIds: PostsTable.imageIds,
        })
        .from(PostsTable)
        .orderBy(asc(PostsTable.createdAt))

export const getPost = (id: number) =>
    db.query.PostsTable.findFirst({
        where: eq(PostsTable.id, id),
    })
