const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    try {
        const query = `
        WITH StudentMaxDates AS (
          SELECT 
            s.student_id,
            MAX(t.date) AS max_date
          FROM student s
          LEFT JOIN timesheet t ON s.student_id = t.student_id
          GROUP BY s.student_id
        )
        SELECT 
          COUNT(*) AS total_students,
          SUM(CASE WHEN t.time_id IS NOT NULL THEN 1 ELSE 0 END) AS attended,
          ROUND(
            COALESCE(
              (SUM(CASE WHEN t.time_id IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / 
              NULLIF(COUNT(*), 0)),
            0), 
          2) AS percentage
        FROM StudentMaxDates smd
        LEFT JOIN timesheet t ON smd.student_id = t.student_id 
          AND smd.max_date = t.date;
      `;

      const [results] = await db.query(query);
      
      res.json({ 
        percentage: results[0]?.percentage || 0,
        total: results[0]?.total_students || 0,
        attended: results[0]?.attended || 0
      });
      
    } catch (err) {
      console.error("Error calculating attendance percentage:", err);
      res.status(500).json({ error: "Failed to calculate attendance percentage" });
    }
  });

  return router;
};