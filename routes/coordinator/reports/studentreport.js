const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { coordinatorId, searchQuery } = req.query;

    try {
      // Validate required query parameters
      if (!coordinatorId || !searchQuery) {
        return res
          .status(400)
          .json({ error: "Missing coordinator ID or search query" });
      }

      const sql = `
        SELECT 
          s.student_id, 
          s.student_name, 
          t.date, 
          t.am_in, 
          t.am_out, 
          t.pm_in, 
          t.pm_out, 
          t.location
        FROM student s
        LEFT JOIN timesheet t ON s.student_id = t.student_id
        WHERE s.coordinator_id = ? AND s.student_name LIKE ?
      `;

      const [results] = await db.query(sql, [
        coordinatorId,
        `%${searchQuery}%`,
      ]);

      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching student timesheets:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
};
