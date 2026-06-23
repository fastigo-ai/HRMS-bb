import nodemailer from "nodemailer";
import logger from "../config/logger.js";

/**
 * Sends an email using nodemailer SMTP transporter, or logs it in development if credentials are absent.
 * @param {Object} options - Email sending options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Text body
 * @param {string} [options.html] - Optional HTML body
 */
export const sendEmail = async (options) => {
  try {
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (hasSmtpConfig) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });


      const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME || "Fastigo X HR Team"} <${process.env.SMTP_FROM_EMAIL || "hr@fastigo.com"}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
      };
      
      

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email successfully sent to ${options.email}. Message ID: ${info.messageId}`);
      return info;
    } else {
      // Ethereal Mail for testing
      logger.info("Generating Ethereal Mail test account...");
      const testAccount = await nodemailer.createTestAccount();
      
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const mailOptions = {
        from: '"Fastigo ATS" <noreply@fastigo.co>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      
      logger.info(`Email sent to ${options.email}`);
      logger.info(`Email Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log(`\n\n=== NEW EMAIL GENERATED ===\nPreview URL: ${nodemailer.getTestMessageUrl(info)}\n===========================\n`);
      
      return info;
    }
  } catch (error) {
    logger.error("Failed to send email (SMTP error). Continuing application flow gracefully:", error.message);
    return null;
  }
};
