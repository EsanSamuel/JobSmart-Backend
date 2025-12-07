import { createTransporter } from "../config/nodemailer";
import logger from "../utils/logger";

export const sendResetEmail = async (email: string, token: string) => {
  try {
    const url = `http://localhost:3000/reset-password?token=${token}`;
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: "noreply@jobsmart.com",
      to: email,
      subject: "Reset your Password",

      html: `
      <p>Click here to reset password: <a href="${url}">Reset Password</a></p>
    `,
    });

    logger.info("Message sent:" + info.messageId);
  } catch (error) {
    logger.info(error);
  }
};
