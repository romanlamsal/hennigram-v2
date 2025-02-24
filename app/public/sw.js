self.addEventListener("fetch", event => {
    const url = new URL(event.request.url)
    if (event.request.method === "POST" && url.pathname === "/share-target") {
        event.respondWith(handleShareTarget(event.request))
    }
})

async function handleShareTarget(request) {
    const formData = await request.formData()
    // Get all files from the "images" field
    const sharedFiles = formData.getAll("images")

    await clearSharedFiles()

    // Store the files in IndexedDB
    await storeSharedFiles(sharedFiles)

    // Redirect to the form page where files will be previewed
    return Response.redirect("/post/edit?shared", 303)
}

// Helper function to open (or create) the IndexedDB database
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("sharedFilesDB", 1)
        request.onupgradeneeded = event => {
            const db = event.target.result
            // Create an object store named "files" if it doesn't exist
            if (!db.objectStoreNames.contains("files")) {
                db.createObjectStore("files", { autoIncrement: true })
            }
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

// Store the shared files in the "files" object store
async function storeSharedFiles(files) {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("files", "readwrite")
        const store = transaction.objectStore("files")
        files.forEach(file => {
            store.add({
                name: file.name,
                type: file.type,
                file: file, // Storing the File/Blob object directly
            })
        })
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
    })
}

async function clearSharedFiles() {
  const db = await openDatabase(); // your function that opens/returns the IndexedDB instance
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => resolve();
    clearRequest.onerror = () => reject(clearRequest.error);
  });
}
