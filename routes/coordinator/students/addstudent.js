const express = require("express");
const router = express.Router();
const sendEmail = require("../../../mailer/emailSender");

module.exports = (db) => {
  // POST endpoint to add a new student
  router.post("/", async (req, res) => {
    const {
      coordinator_id,
      student_name,
      student_address,
      student_contact,
      student_sex,
      company_id,
      student_status,
      student_email,
      student_schoolid,
      student_password,
    } = req.body;

    try {
      // Validate required fields
      if (
        !coordinator_id ||
        !student_name ||
        !student_address ||
        !student_contact ||
        !student_sex ||
        !company_id ||
        !student_status ||
        !student_email ||
        !student_schoolid ||
        !student_password
      ) {
        return res.status(400).json({ message: "All fields are required." });
      }

      // Check for duplicates (email, school ID, contact)
      const checkQuery = `
        SELECT 
          SUM(student_email = ?) as email_exists,
          SUM(student_schoolid = ?) as schoolid_exists,
          SUM(student_contact = ?) as contact_exists
        FROM student
      `;
      const [checkResult] = await db.query(checkQuery, [
        student_email,
        student_schoolid,
        student_contact,
      ]);

      const { email_exists, schoolid_exists, contact_exists } = checkResult[0];
      const errors = [];
      if (email_exists > 0) errors.push("Email already exists");
      if (schoolid_exists > 0) errors.push("School ID already exists");
      if (contact_exists > 0) errors.push("Contact number already exists");
      if (errors.length > 0) {
        return res.status(409).json({ message: errors.join(", ") });
      }

      // Fetch the most recent school year
      const yearQuery = `SELECT year_id FROM school_year ORDER BY year_id DESC LIMIT 1`;
      const [yearResult] = await db.query(yearQuery);

      const year_id = yearResult.length > 0 ? yearResult[0].year_id : null;
      if (!year_id) {
        return res.status(400).json({ message: "No school year available." });
      }

      // Insert the new student
      const insertQuery = `
        INSERT INTO student 
        (coordinator_id, student_name, student_address, student_contact, student_sex, company_id, year_id, student_status, student_email, student_schoolid, student_password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [insertResult] = await db.query(insertQuery, [
        coordinator_id,
        student_name,
        student_address,
        student_contact,
        student_sex,
        company_id,
        year_id,
        student_status,
        student_email,
        student_schoolid,
        student_password,
      ]);

      // Fetch the newly inserted student for response
      const fetchQuery = `SELECT * FROM student WHERE student_id = ?`;
      const [fetchResult] = await db.query(fetchQuery, [insertResult.insertId]);

      const newStudent = fetchResult[0];

      // Send email to student
      const emailSubject = "Student Account Credentials";
      const emailBody = `
        Dear ${student_name},
        
        Welcome to our system! Here are your account credentials:
        
        - User: ${student_schoolid}
        - Password: ${student_password}
        
        Please keep this information safe and do not share it with anyone.
        Download our app in the link below to get started:
        
       ANDROID: https://drive.google.com/file/d/1TituXQ4U_RWohjKSP93hMAzIi234Lm8o/view?usp=sharing


        Regards,
        Your Coordinator Team
      `;

      const emailResponse = await sendEmail(
        student_email,
        emailSubject,
        emailBody
      );
      if (!emailResponse.success) {
        return res.status(201).json({
          message: "Student added successfully, but email sending failed.",
          student: newStudent,
          emailError: emailResponse.error,
        });
      }

      // Return success response with new student data
      res.status(201).json({
        message: "Student added successfully and email sent",
        student: newStudent,
      });
    } catch (err) {
      console.error("Error in POST /student:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  // PUT endpoint to update a student
  router.put("/:student_id", async (req, res) => {
    const studentId = req.params.student_id;
    const {
      coordinator_id,
      student_name,
      student_address,
      student_contact,
      student_sex,
      company_id,
      student_status,
      student_email,
      student_schoolid,
      student_password,
    } = req.body;

    try {
      // Validate required fields
      if (
        !coordinator_id ||
        !student_name ||
        !student_address ||
        !student_contact ||
        !student_sex ||
        !company_id ||
        !student_status ||
        !student_email ||
        !student_schoolid ||
        !student_password
      ) {
        return res.status(400).json({ message: "All fields are required." });
      }

      // Check for existing email, school ID, or contact (excluding current student)
      const checkQuery = `
        SELECT 
          SUM(student_email = ?) as email_exists,
          SUM(student_schoolid = ?) as schoolid_exists,
          SUM(student_contact = ?) as contact_exists
        FROM student
        WHERE student_id != ?
      `;
      const [checkResult] = await db.query(checkQuery, [
        student_email,
        student_schoolid,
        student_contact,
        studentId,
      ]);

      const { email_exists, schoolid_exists, contact_exists } = checkResult[0];
      const errors = [];
      if (email_exists > 0) errors.push("Email already exists");
      if (schoolid_exists > 0) errors.push("School ID already exists");
      if (contact_exists > 0) errors.push("Contact number already exists");
      if (errors.length > 0) {
        return res.status(409).json({ message: errors.join(", ") });
      }

      // Update student data
      const updateQuery = `
        UPDATE student
        SET 
          coordinator_id = ?,
          student_name = ?,
          student_address = ?,
          student_contact = ?,
          student_sex = ?,
          company_id = ?,
          student_status = ?,
          student_email = ?,
          student_schoolid = ?,
          student_password = ?
        WHERE student_id = ?
      `;
      const [updateResult] = await db.query(updateQuery, [
        coordinator_id,
        student_name,
        student_address,
        student_contact,
        student_sex,
        company_id,
        student_status,
        student_email,
        student_schoolid,
        student_password,
        studentId,
      ]);

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.status(200).json({ message: "Student updated successfully" });
    } catch (err) {
      console.error("Error in PUT /student/:student_id:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
