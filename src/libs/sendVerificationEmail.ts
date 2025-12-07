import { createTransporter } from "../config/nodemailer";
import logger from "../utils/logger";

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const url = `http://localhost:5000/verify-email?token=${token}`;
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: "noreply@jobsmart.com",
      to: email,
      subject: "Reset your Password",

      html: `
      <p>Click here to verify email: <a href="${url}">Verfify Email</a></p>
    `,
    });

    logger.info("Message sent:" + info.messageId);
  } catch (error) {
    logger.info(error);
  }
};
