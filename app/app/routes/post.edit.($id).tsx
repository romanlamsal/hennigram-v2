import { type FileUpload, parseFormData } from "@mjackson/form-data-parser"
import { PlusIcon, Trash } from "lucide-react"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"
import { NavLink, redirect, useFetcher, useSearchParams } from "react-router"
import { getPublicUrl, uploadFile } from "~/lib/blob-storage.server"
import { Button } from "~/lib/components/ui/button"
import { Input } from "~/lib/components/ui/input"
import { textVariants } from "~/lib/components/ui/textVariants"
import { Textarea } from "~/lib/components/ui/textarea"
import { useToast } from "~/lib/hooks/use-toast"
import type { Route } from "./+types/post.edit.($id)"

import { eq } from "drizzle-orm"
import { db } from "~/db"
import { PostsTable } from "~/db/schema"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/lib/components/ui/dialog"
import { PostInsertSchema, getPost } from "~/lib/posts.db.server"

export const loader = async ({ params }: Route.LoaderArgs) => {
    return {
        initialData: params.id ? await getPost(Number.parseInt(params.id)) : undefined,
    }
}

function openDatabase() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("sharedFilesDB", 1)
        request.onupgradeneeded = event => {
            // @ts-ignore
            const db = event.target.result
            if (!db.objectStoreNames.contains("files")) {
                db.createObjectStore("files", { autoIncrement: true })
            }
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

// Retrieve all shared files from the "files" object store
async function getSharedFiles() {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("files", "readonly")
        const store = transaction.objectStore("files")
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

export const action = async ({ request, params }: Route.ActionArgs) => {
    if (request.method === "DELETE" && params.id) {
        const id = Number.parseInt(params.id)
        await db.delete(PostsTable).where(eq(PostsTable.id, id))
        return redirect("/")
    }

    if (request.method !== "POST") {
        throw new Response("", {
            status: 405,
        })
    }

    const uploadHandler = async (fileUpload: FileUpload) => {
        if (fileUpload.fieldName === "image" && fileUpload.type.startsWith("image/")) {
            return getPublicUrl(await uploadFile(fileUpload)).data.publicUrl
        }
    }

    const formData = await parseFormData(request, uploadHandler)

    const validation = PostInsertSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        imageIds: formData.getAll("image"),
    })

    if (!validation.success) {
        throw new Response("bad-data", {
            statusText: "Faulty input data",
            status: 400,
        })
    }

    if (params.id) {
        await db
            .update(PostsTable)
            .set(validation.data)
            .where(eq(PostsTable.id, Number.parseInt(params.id)))
    } else {
        await db.insert(PostsTable).values(validation.data)
    }

    return Response.json({ ok: true })
}

type ImageConfig = File | string

const ImageUploads = ({
    imageConfigs,
    onChangeImageConfigs,
}: { imageConfigs: ImageConfig[]; onChangeImageConfigs: Dispatch<SetStateAction<ImageConfig[]>> }) => {
    function addFiles(files?: FileList | null) {
        if (!files || !files.length) {
            return
        }

        onChangeImageConfigs(prev => [...prev, ...Array.from(files)])
    }

    return (
        <figure>
            <figcaption>Bilder</figcaption>
            <label
                className={"bg-gray-500 border rounded-xl cursor-pointer w-max !flex items-center px-2"}
                onDragEnter={ev => {
                    ev.preventDefault()
                    return false
                }}
                onDragOver={ev => {
                    ev.preventDefault()
                    return false
                }}
                onDragLeave={ev => {
                    ev.preventDefault()
                    return false
                }}
                onDrop={ev => {
                    ev.preventDefault()
                    ev.stopPropagation()

                    addFiles(ev.nativeEvent.dataTransfer?.files)
                }}
            >
                <PlusIcon className={"size-12"} />
                <span className={""}>Hier klicken oder herziehen um Bilder hochladen</span>
                <input
                    className={"hidden"}
                    type={"file"}
                    accept={"image/*"}
                    multiple
                    onChange={ev => {
                        addFiles(ev.currentTarget.files)
                    }}
                />
            </label>
            <ul className={"flex flex-wrap gap-4 items-center mt-2"}>
                {imageConfigs.map((fileOrUrl, idx) => {
                    let props: { src: string; onLoad?: () => void }
                    if (typeof fileOrUrl === "string") {
                        props = { src: fileOrUrl }
                    } else {
                        const objectURL = URL.createObjectURL(fileOrUrl)
                        props = { src: objectURL, onLoad: () => URL.revokeObjectURL(objectURL) }
                    }

                    return (
                        <li key={idx} className={"relative"}>
                            <img {...props} alt={`post-image-${idx}`} className={"size-48 object-cover"} />
                            <a
                                className={"absolute top-0 right-0 text-red-500 cursor-pointer"}
                                onClick={() => {
                                    onChangeImageConfigs(prev => {
                                        const copy = [...prev]
                                        copy.splice(idx, 1)
                                        return copy
                                    })
                                }}
                            >
                                <Trash className={"size-8"} />
                            </a>
                        </li>
                    )
                })}
            </ul>
        </figure>
    )
}

export default function PostsEdit({ loaderData: { initialData } }: Route.ComponentProps) {
    const [searchParams] = useSearchParams()
    const fetcher = useFetcher()
    const [imageConfigs, setImageConfigs] = useState<ImageConfig[]>(() => {
        return initialData?.imageIds || []
    })

    const { toast } = useToast()

    useEffect(() => {
        if (searchParams.has("shared")) {
            getSharedFiles().then(sharedFiles => {
                setImageConfigs(prev => [...prev, ...(sharedFiles as { file: File }[]).map(({ file }) => file)])
            })
        }
    }, [])

    return (
        <fetcher.Form
            className={"[&_label]:block pt-12 space-y-4"}
            onSubmit={ev => {
                ev.preventDefault()

                const formData = new FormData(ev.currentTarget)

                for (const imageConfig of imageConfigs) {
                    formData.append("image", imageConfig)
                }

                fetcher
                    .submit(formData, {
                        encType: "multipart/form-data",
                        method: "POST",
                    })
                    .then(() => {
                        toast({
                            title: "Anzeige gespeichert",
                            description: "Deine Anzeige wurde erfolgreich gespeichert.",
                            variant: "success",
                        })
                    })
            }}
        >
            <header className={"flex items-center justify-between"}>
                <h1 className={textVariants({ variant: "h1" })}>Anzeige {initialData ? "bearbeiten" : "aufgeben"}</h1>
                {initialData && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant={"destructive"}>
                                <Trash /> Löschen
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Anzeige löschen?</DialogTitle>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button>Abbrechen</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button
                                        variant={"destructive"}
                                        onClick={() => fetcher.submit({}, { method: "DELETE" })}
                                    >
                                        Löschen
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </header>

            <label>
                Titel
                <Input name={"title"} defaultValue={initialData?.title} required />
            </label>
            <label>
                Beschreibung
                <Textarea name={"description"} defaultValue={initialData?.description} required className={"h-40"} />
            </label>
            <ImageUploads imageConfigs={imageConfigs} onChangeImageConfigs={setImageConfigs} />

            <footer className={"flex justify-between"}>
                <NavLink to={"/"}>
                    <Button variant={"secondary"}>Zurück</Button>
                </NavLink>
                <Button disabled={fetcher.state !== "idle"}>Speichern</Button>
            </footer>
        </fetcher.Form>
    )
}
