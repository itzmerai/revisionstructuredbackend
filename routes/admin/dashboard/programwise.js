const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    try {
      const query = `
        SELECT 
          p.program_name AS program,
          COUNT(s.student_id) AS student_count
        FROM program p
        LEFT JOIN coordinator c ON p.program_id = c.program_id
        LEFT JOIN student s ON c.coordinator_id = s.coordinator_id
        GROUP BY p.program_name
        ORDER BY student_count DESC
        LIMIT 3
      `;

      const [results] = await db.query(query);
      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching program distribution:", err);
      res.status(500).json({ 
        message: "Error fetching program distribution data",
        error: err.message 
      });
    }
  });

  return router;
};