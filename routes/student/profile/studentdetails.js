const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const student_id = req.query.student_id;

    if (!student_id) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const query = `
      SELECT 
        s.student_name, 
        s.student_address, 
        s.student_contact,
        s.student_schoolid,
        s.student_sex,
        s.student_email, 
        c.company_name, 
        c.company_address, 
        c.company_mentor, 
        c.company_contact, 
        p.program_name, 
        sy.school_yr 
      FROM student s
      LEFT JOIN company c ON s.company_id = c.company_id
      LEFT JOIN coordinator co ON s.coordinator_id = co.coordinator_id
      LEFT JOIN program p ON co.program_id = p.program_id
      LEFT JOIN school_year sy ON s.year_id = sy.year_id
      WHERE s.student_id = ?;
    `;

    try {
      const [results] = await db.query(query, [student_id]);

      if (results.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.status(200).json({ studentDetails: results[0] });
    } catch (err) {
      console.error("Error fetching student details:", err);
      return res
        .status(500)
        .json({ message: "Database error", error: err.message });
    }
  });

  return router;
};
