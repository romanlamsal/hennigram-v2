import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(env => {
    return {
        plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
        ssr: {
            noExternal: env.isSsrBuild ? true : undefined,
        },
    }
})
