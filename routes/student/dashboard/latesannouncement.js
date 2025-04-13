const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { student_id } = req.query;
  
    if (!student_id) {
      return res.status(400).json({ error: "Missing student_id parameter." });
    }
  
    try {
      const [combinedResult] = await db.query(`
        (SELECT 
          announce_id AS id,
          announcement_type AS type,
          announcement_date AS date,
          announcement_content AS content,
          'announcement' AS source
        FROM announce
        WHERE coordinator_id = (
          SELECT coordinator_id FROM student WHERE student_id = ?
        ))
        
        UNION ALL
        
        (SELECT 
          t.task_id AS id,
          'TASK' AS type,
          t.task_created AS date,
          CONCAT('New Task "', t.task_title, '"') AS content,
          'task' AS source
        FROM task_assingment ta
        JOIN task t ON ta.task_id = t.task_id
        WHERE ta.student_id = ?)
        
        ORDER BY date DESC
      `, [student_id, student_id]);
  
      res.json({ announcements: combinedResult });
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });

  return router;
};
