const nodemailer = require("nodemailer");
const dns = require("dns");

// Force Node to prefer IPv4 resolution globally for this process
dns.setDefaultResultOrder("ipv4first");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  try {
    console.log(`Attempting to send email to ${to}...`);
    const info = await transporter.sendMail({
      from: `"KukrooKoo 🐓" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw error;
  }
};

module.exports = sendEmail;