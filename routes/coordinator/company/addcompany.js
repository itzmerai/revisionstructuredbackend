const express = require("express");
const router = express.Router();
const sendEmail = require("../../../mailer/emailSender");

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const {
      coordinator_id,
      company_name,
      company_address,
      company_mentor,
      company_contact,
      company_email
    } = req.body;

    try {
      // Validate input
      if (
        !coordinator_id ||
        !company_name ||
        !company_address ||
        !company_mentor ||
        !company_contact ||
        !company_email
      ) {
        return res.status(400).json({ message: "All fields are required." });
      }

      // Auto-generate company_user based on company_name
      const formattedName = company_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_") // Replace spaces/special chars with '_'
        .replace(/^_+|_+$/g, ""); // Trim leading/trailing underscores

      // Ensure uniqueness by appending a random number (if needed)
      const uniqueIdentifier = Math.floor(1000 + Math.random() * 9000);
      const company_user = `${formattedName}_${uniqueIdentifier}`;

      // Auto-generate a random 8-character password
      const company_password = Math.random().toString(36).slice(-8);

      // Insert into database
      const query = `
        INSERT INTO company 
        (coordinator_id, company_name, company_address, company_mentor, company_contact, company_email, company_user, company_password)
        VALUES (?, ?, ?, ?, ?, ?, ?,?)
      `;

      const [result] = await db.query(query, [
        coordinator_id,
        company_name,
        company_address,
        company_mentor,
        company_contact,
        company_email,
        company_user,
        company_password
      ]);

      // Send email with credentials
      const emailSubject = "Your Company Account Credentials";
      const emailBody = `
        Dear ${company_name},

        Welcome to our system! Here are your account credentials:

        - User: ${company_user}
        - Password: ${company_password}

        Please keep this information safe and do not share it with anyone.

        Regards,
        Your OJT Monitoring Team
      `;

      const emailResponse = await sendEmail(company_email, emailSubject, emailBody);

      if (!emailResponse.success) {
        return res.status(201).json({
          message: "Company added successfully, but email sending failed.",
          company_id: result.insertId,
          emailError: emailResponse.error,
        });
      }

      res.status(201).json({
        message: "Company added successfully and email sent.",
        company_id: result.insertId,
        company_user,
        company_password
      });

    } catch (err) {
      console.error("Error inserting company:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
