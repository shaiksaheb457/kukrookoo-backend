const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(`Attempting to send email to ${to}...`);
    const result = await resend.emails.send({
      from: "KukrooKoo <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log("Email sent successfully:", result.data?.id);
    return result;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw error;
  }
};

module.exports = sendEmail;