const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { company_id, searchQuery } = req.query;

    try {
      // Validate required query parameters
      if (!company_id) {
        return res.status(400).json({ error: "Company ID is required" });
      }

      if (!searchQuery) {
        return res.status(400).json({ error: "Search query is required" });
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
        INNER JOIN timesheet t ON s.student_id = t.student_id
        WHERE s.company_id = ? 
          AND s.student_name LIKE ?
      `;

      const [results] = await db.query(sql, [company_id, `%${searchQuery}%`]);

      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching student timesheets:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
};
