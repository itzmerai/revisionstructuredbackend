const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { coordinator_id } = req.query;

    try {
      const query = `
        SELECT c.company_name, COUNT(s.student_id) as student_count
        FROM company c
        LEFT JOIN student s ON c.company_id = s.company_id
        WHERE c.coordinator_id = ?
        GROUP BY c.company_id
        ORDER BY student_count DESC
        LIMIT 3
      `;

      const [results] = await db.query(query, [coordinator_id]);
      res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching top companies:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  return router;
};
