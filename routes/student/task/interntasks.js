// routes/tasks.js
const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // Get assigned tasks for a student
  router.get("/assigned-tasks", async (req, res) => {
    const { student_id } = req.query;

    try {
      if (!student_id) {
        return res.status(400).json({ error: "Missing student ID" });
      }

      const sql = `
        SELECT 
          t.task_id,
          t.task_title,
          t.task_description,
          DATE_FORMAT(t.task_created, '%Y-%m-%d') AS task_created,
          ta.task_rating
        FROM task t
        INNER JOIN task_assingment ta ON t.task_id = ta.task_id
        WHERE ta.student_id = ?
        ORDER BY t.task_created DESC
      `;

      const [results] = await db.query(sql, [student_id]);
      res.status(200).json(results);
      
    } catch (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
};