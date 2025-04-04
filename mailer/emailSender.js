const nodemailer = require("nodemailer");

// Create a transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service (e.g., Gmail, Outlook)
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
  tls: {
    rejectUnauthorized: false, // Bypass self-signed certificate issues
  },
});

// Function to send an email (returns a Promise)
const sendEmail = async (to, subject, text) => {
  try {
    console.log(`Attempting to send email to: ${to}`); // Debugging
    console.log(`Email subject: ${subject}`); // Debugging
    console.log(`Email body: ${text}`); // Debugging

    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return { success: true, response: info.response };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

module.exports = sendEmail;
