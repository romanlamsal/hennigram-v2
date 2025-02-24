declare global {
    // biome-ignore lint/style/noNamespace: <explanation>
    namespace NodeJS {
        interface ProcessEnv {
            COOKIE_SECRET: string
            DATABASE_URL: string

            SUPABASE_PROJECT_URL: string
            SUPABASE_KEY: string

            SMTP_USER: string
            SMTP_PASSWORD: string
        }
    }
}

export default {}
