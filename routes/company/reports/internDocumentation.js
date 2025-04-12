const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // Get students with task uploads for a company
  router.get("/students-with-uploads", async (req, res) => {
    const { companyId } = req.query;

    try {
      if (!companyId) {
        return res.status(400).json({ error: "Missing company ID" });
      }

      const sql = `
        SELECT 
          s.student_id,
          s.student_name,
          COUNT(ut.uploaded_task_id) AS upload_count
        FROM student s
        INNER JOIN uploaded_task ut ON s.student_id = ut.student_id
        WHERE s.company_id = ?
        GROUP BY s.student_id
      `;

      const [results] = await db.query(sql, [companyId]);
      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching students with uploads:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Get task documents for a student
  router.get("/student-task-documents", async (req, res) => {
    const { studentId } = req.query;

    try {
      if (!studentId) {
        return res.status(400).json({ error: "Missing student ID" });
      }

      const sql = `
        SELECT 
          ut.uploaded_task_id,
          ut.remarks,
          ut.uploaded_taskdocument,
          t.task_title,
          DATE_FORMAT(ut.uploaded_taskdate, '%Y-%m-%d %H:%i:%s') AS uploaded_date
        FROM uploaded_task ut
        INNER JOIN task t ON ut.task_id = t.task_id
        WHERE ut.student_id = ?
        ORDER BY ut.uploaded_taskdate DESC
      `;

      const [results] = await db.query(sql, [studentId]);
      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching task documents:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
};