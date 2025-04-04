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
        SELECT COUNT(DISTINCT student_id) AS studentCount
        FROM student
        WHERE coordinator_id = ?
      `;

      const [results] = await db.query(query, [coordinator_id]);

      res.status(200).json({ count: results[0].studentCount });
    } catch (err) {
      console.error("Error counting students:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
