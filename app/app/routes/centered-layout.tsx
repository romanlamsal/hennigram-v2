import { Outlet } from "react-router"
import { Footer } from "~/lib/components/Footer"
import { cn } from "~/lib/utils"

export default function CenteredLayout() {
    return (
        <>
            <main className={cn("max-w-screen-lg w-full mx-auto px-4 pb-32")}>
                <Outlet />
            </main>
            <Footer />
        </>
    )
}
