import { createTransporter } from "../config/nodemailer";
import logger from "../utils/logger";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const url = `http://localhost:3000/verify-email?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: "JobSmart <noreply@mikaelsoninitiative.org>",
      to: email,
      subject: "Verify your Email",
      html: `
<div style="max-width: 500px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
  
  <h2 style="color: #111827; text-align: center; margin-bottom: 10px;">
    Confirm Your Signup
  </h2>

  <p style="color: #374151; font-size: 15px; text-align: center;">
    Hey there 👋
  </p>

  <p style="color: #374151; font-size: 15px; text-align: center; line-height: 1.5;">
    Thanks for joining the <b>Pre Launch</b>! Please confirm your email address to activate your account.
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${url}"
       style="
         background-color: #2563eb;
         color: #ffffff;
         padding: 14px 30px;
         text-decoration: none;
         border-radius: 6px;
         font-weight: bold;
         display: inline-block;
         font-size: 16px;
       ">
      Confirm Email
    </a>
  </div>

  <p style="color: #6b7280; font-size: 14px; text-align: center; line-height: 1.4;">
    If you didn’t sign up, you can safely ignore this email.
  </p>

</div>
      `,
    });

    if (error) {
      logger.error("Resend error:" + error);
      return;
    }

    logger.info("Message sent via Resend:" + data?.id);
  } catch (error) {
    logger.error("Failed to send email:" + error);
  }
};
