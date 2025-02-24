import { Home } from "lucide-react"
import { NavLink } from "react-router"

export const Footer = () => {
    return (
        <footer
            className={"fixed bottom-0 left-0 right-0 py-8 dark:text-white text-black dark:bg-zinc-800 bg-gray-200"}
        >
            <nav className={"max-w-screen-lg w-full mx-auto px-4"}>
                <ol className={"flex gap-8"}>
                    <li>
                        <NavLink to={"/"}>
                            <Home className={"size-4 inline"} /> Home
                        </NavLink>
                    </li>
                </ol>
            </nav>
        </footer>
    )
}
