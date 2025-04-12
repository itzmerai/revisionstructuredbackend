const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/intern-progress", async (req, res) => {
    const { coordinator_id } = req.query;

    try {
      if (!coordinator_id) {
        return res.status(400).json({ message: "Coordinator ID is required" });
      }

      const query = `
        SELECT 
          s.student_schoolid AS school_id,
          s.student_name,
          c.company_name AS company,
          t.task_title AS task,
          COALESCE(ta.task_rating, 0) AS progress
        FROM student s
        INNER JOIN company c ON s.company_id = c.company_id
        INNER JOIN task_assingment ta ON s.student_id = ta.student_id
        INNER JOIN task t ON ta.task_id = t.task_id
        WHERE c.coordinator_id = ?
      `;

      const [results] = await db.query(query, [coordinator_id]);
      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching intern progress:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};