import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT), // Ensure it's a number
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  console.log('SMTP Config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_EMAIL,
    password: process.env.SMTP_PASSWORD, // Be cautious when logging sensitive data
  });

  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    await transport.sendMail(message);
    console.log("Email sent successfully to:", options.email);
  } catch (error) {
    console.error("Error sending email:", error); // Log detailed error information
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
