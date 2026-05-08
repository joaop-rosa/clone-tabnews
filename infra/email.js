import nodemailer from "nodemailer"
import { ServiceError } from "./errors.js"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  secure: process.env.NODE_ENV === "production" ? true : false,
})

async function send(mailOptions) {
  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    throw new ServiceError({
      message: "Não foi possível enviar o email.",
      action: "Verifique se o serviço de email está disponível.",
      cause: error,
      context: mailOptions,
    })
  }
}

const email = {
  send,
}

export default email
