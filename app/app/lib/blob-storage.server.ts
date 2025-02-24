import { randomUUID } from "node:crypto"
import type { FileUpload } from "@mjackson/form-data-parser"
import { createClient } from "@supabase/supabase-js"
import { $env } from "./$env.server"

const supabase = createClient($env.SUPABASE_PROJECT_URL, $env.SUPABASE_KEY)

export async function uploadFile(file: FileUpload) {
    const fileId = randomUUID() + "-" + file.name
    console.log("Uploading:", file.name, "with id", fileId)

    const uploadPromise = supabase.storage.from("hennigram-uploads").upload(fileId, file.stream(), {
        contentType: file.type,
        duplex: "half",
    })

    const { data, error } = await uploadPromise

    if (error) {
        console.error("Error when trying to upload a file:", error)
        throw error
    }

    if (!data) {
        throw new Error("No data found and no error thrown, what's going on man?")
    }

    return fileId
}

export function getPublicUrl(fileId: string) {
    return supabase.storage.from("hennigram-uploads").getPublicUrl(fileId)
}
