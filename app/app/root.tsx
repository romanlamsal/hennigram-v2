import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from "react-router"

import type { Route } from "./+types/root"
import "./app.css"
import { useEffect } from "react"
import { Toaster } from "./lib/components/ui/toaster"

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de">
            <head>
                <meta charSet="utf-8" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body className={""}>
                {children}
                <Toaster />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    )
}

export default function App() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker
                    .register("/sw.js")
                    .then(registration => {
                        console.log("Service Worker registered with scope:", registration.scope)
                    })
                    .catch(error => {
                        console.error("Service Worker registration failed:", error)
                    })
            })
        }
    }, [])

    return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!"
    let details = "An unexpected error occurred."
    let stack: string | undefined

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error"
        details = error.status === 404 ? "The requested page could not be found." : error.statusText || details
    } else if (error && error instanceof Error) {
        details = error.message
        stack = error.stack
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    )
}
