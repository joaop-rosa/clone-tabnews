import nodemailer from "nodemailer"

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
  await transporter.sendMail(mailOptions)
}

const email = {
  send,
}

export default email
