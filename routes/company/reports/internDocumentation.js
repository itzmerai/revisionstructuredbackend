const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // Endpoint to get students with uploads for a specific company
  router.get("/students-with-uploads", async (req, res) => {
    const { company_id } = req.query;

    try {
      if (!company_id) {
        return res.status(400).json({ error: "Missing company ID" });
      }

      const sql = `
        SELECT 
          s.student_id,
          s.student_name,
          COUNT(d.document_id) AS upload_count
        FROM student s
        INNER JOIN document d ON s.student_id = d.student_id
        WHERE s.company_id = ?
        GROUP BY s.student_id
      `;

      const [results] = await db.query(sql, [company_id]);
      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching students with uploads:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Endpoint to get all documents for a specific student
  router.get("/student-documents", async (req, res) => {
    const { studentId } = req.query;

    try {
      if (!studentId) {
        return res.status(400).json({ error: "Missing student ID" });
      }

      const sql = `
        SELECT 
          d.document_id,
          d.remarks,
          d.uploaded_file,
          DATE_FORMAT(d.date_uploaded, '%Y-%m-%d %H:%i:%s') AS date_uploaded
        FROM document d
        WHERE d.student_id = ?
        ORDER BY d.date_uploaded DESC
      `;

      const [results] = await db.query(sql, [studentId]);
      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching student documents:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
};
