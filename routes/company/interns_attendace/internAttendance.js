const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { company_id } = req.query;

    try {
      // Validate company_id
      if (!company_id) {
        return res.status(400).json({ message: "Company ID is required" });
      }

      const query = `
        SELECT 
          t.time_id, 
          t.student_id, 
          s.student_name, 
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
        WHERE 
          t.company_id = ?
          AND t.date = (SELECT MAX(date) FROM timesheet WHERE company_id = t.company_id)
        ORDER BY 
          t.date DESC;
      `;

      const [results] = await db.query(query, [company_id]);

      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching timesheet data:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
