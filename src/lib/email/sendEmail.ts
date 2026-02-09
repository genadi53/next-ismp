import * as nodemailer from "nodemailer";
import { env } from "@/env";

const transporterServer = nodemailer.createTransport({
  host: "mail.ellatzite-med.com",
  port: 25,
  secure: false,
  auth: {
    user: env.TEST_EMAIL_USER,
    pass: env.TEST_EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ⚠️ disables CA validation
  },
});

export const sendEmail = async (subject: string, html: string, to: string) => {
  if (!transporterServer) {
    console.error("No transporterServer");
    return;
  }

  try {
    const info = await transporterServer.sendMail({
      from: env.MAIN_EMAIL_USER,
      to: to,
      subject: subject,
      html: html,
    });

    // console.log("Message sent:", info.messageId);
    return info.messageId;
  } catch (error) {
    console.error(error);
    return;
  }
};
