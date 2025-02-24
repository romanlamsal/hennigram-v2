import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

const key = randomBytes(32)

const encryptSymmetric = (plaintext: string) => {
    // create a random initialization vector
    const iv = randomBytes(12).toString("base64")

    // create a cipher object
    const cipher = createCipheriv("aes-256-gcm", key, iv)

    // update the cipher object with the plaintext to encrypt
    let ciphertext = cipher.update(plaintext, "utf8", "base64")

    // finalize the encryption process
    ciphertext += cipher.final("base64")

    // retrieve the authentication tag for the encryption
    const tag = cipher.getAuthTag().toString("base64")

    return { ciphertext, iv, tag }
}

const decryptSymmetric = (ciphertext: string, iv: string, tag: string) => {
    const decipher = createDecipheriv("aes-256-gcm", key, iv)

    decipher.setAuthTag(Buffer.from(tag, "base64"))

    let plaintext = decipher.update(ciphertext, "base64", "utf8")
    plaintext += decipher.final("utf8")

    return plaintext
}

export const createSessionToken = (userEmail: string) => {
    try {
        const { ciphertext, iv, tag } = encryptSymmetric(userEmail)

        return [ciphertext, iv, tag].join(".")
    } catch (e) {
        console.error("Error creating session token:", e)
        return
    }
}

export const readSessionToken = (sessionToken: string) => {
    try {
        const [ciphertext, iv, tag] = sessionToken.split(".")

        return decryptSymmetric(ciphertext, iv, tag)
    } catch (e) {
        console.error("Error decrypting sessionToken")
        return
    }
}
