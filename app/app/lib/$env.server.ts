import { object, string } from "zod"

export const $env = object({
    COOKIE_SECRET: string(),
    DATABASE_URL: string(),
    SUPABASE_PROJECT_URL: string(),
    SUPABASE_KEY: string(),
    PASSWORD: string(),
}).parse(process.env)
