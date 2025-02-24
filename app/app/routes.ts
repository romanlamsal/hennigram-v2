import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
    layout("routes/centered-layout.tsx", [
        index("routes/home.tsx"),
        route("post/edit/:id?", "routes/post.edit.($id).tsx"),
    ]),
    route("/login", "routes/login/route.tsx"),
] satisfies RouteConfig
