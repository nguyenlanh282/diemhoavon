import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function verifyConnection() {
  try {
    await transporter.verify()
    console.log('SMTP connection verified')
    return true
  } catch (error) {
    console.error('SMTP connection failed:', error)
    return false
  }
}
