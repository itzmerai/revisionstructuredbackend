const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { coordinator_id } = req.query;

    try {
      // Validate coordinator_id
      if (!coordinator_id) {
        return res.status(400).json({ message: "Coordinator ID is required" });
      }

      const query = `
        SELECT 
          t.time_id, 
          t.student_id, 
          s.student_name, 
          c.company_name, 
          t.date, 
          t.am_in, 
          t.am_out, 
          t.pm_in, 
          t.pm_out, 
          t.location
        FROM 
          timesheet t
        INNER JOIN 
          student s ON t.student_id = s.student_id
        INNER JOIN 
          company c ON t.company_id = c.company_id
        WHERE 
          c.coordinator_id = ?
          AND t.date = (SELECT MAX(date) FROM timesheet WHERE company_id = c.company_id)
        ORDER BY 
          t.date DESC;
      `;

      const [results] = await db.query(query, [coordinator_id]);

      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching timesheet data:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
