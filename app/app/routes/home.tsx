import { Plus } from "lucide-react"
import { Suspense, useMemo, useState } from "react"
import { Await, NavLink } from "react-router"
import { Button } from "~/lib/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/lib/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/lib/components/ui/carousel"
import { textVariants } from "~/lib/components/ui/textVariants"
import { listPosts } from "~/lib/posts.db.server"
import type { Route } from "./+types/home"

export function meta() {
    return [{ title: `Hennigram` }]
}

export const loader = async () => {
    return {
        Posts: listPosts(),
    }
}

type Post = Awaited<Awaited<Route.ComponentProps["loaderData"]>["Posts"]>[number]

const PostCard = ({ Post }: { Post: Post }) => {
    const [more, setMore] = useState(false)

    const maxDescriptionLength = 150

    const shouldTruncate = useMemo(() => Post.description.length > maxDescriptionLength, [more, Post.description])

    const description = useMemo(
        () => (shouldTruncate && !more ? Post.description.slice(0, maxDescriptionLength - 1) + "…" : Post.description),
        [more, shouldTruncate],
    )

    return (
        <Card className={"h-full grid grid-rows-[auto_1fr]"}>
            <CardHeader className={""}>
                <CardTitle className={textVariants({ variant: "h3" })}>{Post.title}</CardTitle>
                <CardDescription>
                    <Carousel className={"mt-4"}>
                        <CarouselContent>
                            {(Post.imageIds.length > 0 ? Post.imageIds : ["/image-not-found.png"]).map(
                                (imageId, imageIdx) => (
                                    <CarouselItem key={imageIdx}>
                                        <img
                                            className={"mx-auto object-cover size-40"}
                                            src={imageId + `?type=small&tag=${Post.id + "-" + imageIdx}`}
                                            alt={`${Post.title} - ${imageIdx}`}
                                        />
                                    </CarouselItem>
                                ),
                            )}
                        </CarouselContent>
                        {Post.imageIds.length > 1 && <CarouselPrevious />}
                        {Post.imageIds.length > 1 && <CarouselNext />}
                    </Carousel>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {description.split("\n").map((block, idx) => (
                    <p key={idx}>{block}</p>
                ))}{" "}
                {shouldTruncate && (
                    <a className={"text-xs text-blue-500 cursor-pointer"} onClick={() => setMore(!more)}>
                        {more ? "weniger" : "mehr"}
                    </a>
                )}
            </CardContent>
        </Card>
    )
}

export default function Home({ loaderData }: Route.ComponentProps) {
    const { Posts } = loaderData
    return (
        <>
            <header className={"my-12 flex items-center justify-between"}>
                <h1 className={textVariants({ variant: "h1" })}>Hennigram</h1>
                <NavLink to={"/post/edit"}>
                    <Button variant={"default"}>
                        <Plus /> Posten
                    </Button>
                </NavLink>
            </header>
            <section className={"mt-12"}>
                <Suspense fallback={<div>loading...</div>}>
                    <Await resolve={Posts}>
                        {data => (
                            <ul className={"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 grid-flow-dense gap-4"}>
                                {data.map(Post => {
                                    return (
                                        <li key={Post.id} className={"min-h-0 h-full overflow-hidden"}>
                                            <PostCard Post={Post} />
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </Await>
                </Suspense>
            </section>
        </>
    )
}
