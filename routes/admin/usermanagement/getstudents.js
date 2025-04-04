const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    try {
      const query = `
        SELECT 
          s.student_schoolid,
          s.student_status, 
          CONCAT(cor.coordinator_firstname, ' ', cor.coordinator_lastname) AS coordinator_name,
          p.program_name,
          com.company_name,
          p.program_hours
        FROM student s
        LEFT JOIN company com ON s.company_id = com.company_id
        LEFT JOIN coordinator cor ON s.coordinator_id = cor.coordinator_id
        LEFT JOIN program p ON cor.program_id = p.program_id;
      `;

      const [results] = await db.query(query);
      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching students:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
