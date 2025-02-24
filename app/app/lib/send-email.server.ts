import { type SendMailOptions, createTransport } from "nodemailer"

const mailTransport = createTransport({
    host: "smtp.ionos.de",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
})

mailTransport.verify(function (error) {
    if (error) {
        console.error("SMTP Connection Error:", error)
    } else {
        console.log("SMTP Server Ready")
    }
})

export const sendEmail = async (options: SendMailOptions) => {
    const fullOptions = {
        from: process.env.SMTP_USER,
        ...options,
    }
    return await mailTransport.sendMail(fullOptions).catch(err => console.error("Error sending email:", err))
}
