import { createMemorySessionStorage } from "react-router"
import { $env } from "./$env.server"

export const sessionCookie = createMemorySessionStorage<{ loggedIn: boolean }>({
    cookie: {
        name: "hennigram.session",
        secrets: [$env.COOKIE_SECRET],
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 60,
    },
})

export const commitSession = async () => {
    const session = await sessionCookie.getSession(null)

    session.set("loggedIn", true)

    return sessionCookie.commitSession(session)
}

export const requireSession = async (request: Request) => {
    const session = await sessionCookie.getSession(request.headers.get("Cookie"))

    return session.data.loggedIn === true
}

export const destroySession = async (request: Request) => {
    const session = await sessionCookie.getSession(request.headers.get("Cookie"))

    return sessionCookie.destroySession(session)
}

/**
 * Keys are sessionIds with the specific data
 */
export const sessions: Record<string, { userEmail?: string }> = {}
