import "dotenv/config"
import { env } from "process";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: Number(env.EMAIL_PORT),
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export async function sendEmail(options : nodemailer.SendMailOptions) {
  try {
    const info = await transporter.sendMail(options);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
