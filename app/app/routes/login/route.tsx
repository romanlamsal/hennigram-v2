import { Form, redirect } from "react-router"
import { $env } from "~/lib/$env.server"
import { commitSession } from "~/lib/auth.db.server"
import { Button } from "~/lib/components/ui/button"
import { Input } from "~/lib/components/ui/input"
import type { Route } from "./+types/route"

export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData()

    const password = formData.get("password")

    if (password !== $env.PASSWORD) {
        return new Response("wrong-password", {
            status: 400,
        })
    }

    return redirect("/", {
        headers: {
            "Set-Cookie": await commitSession(),
        },
    })
}

export default function Login() {
    return (
        <Form method={"POST"} className={"flex items-center justify-center h-screen"}>
            <Input type={"password"} name={"password"} placeholder={"Passwort"} className={"max-w-screen-sm w-full"} />
            <Button>Send</Button>
        </Form>
    )
}
