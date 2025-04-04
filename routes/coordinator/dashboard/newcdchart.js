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
          c.company_name AS company,
          COUNT(s.student_id) AS count
        FROM company c
        LEFT JOIN student s ON c.company_id = s.company_id
        WHERE c.coordinator_id = ?
        GROUP BY c.company_name
        ORDER BY count DESC
        LIMIT 3
      `;

      const [results] = await db.query(query, [coordinator_id]);

      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching company distribution:", err);
      res.status(500).json({ 
        message: "Error fetching company distribution data",
        error: err.message 
      });
    }
  });

  return router;
};