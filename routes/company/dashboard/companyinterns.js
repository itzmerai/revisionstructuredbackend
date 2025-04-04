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
        SELECT COUNT(DISTINCT student_id) AS studentCount
        FROM student
        WHERE company_id = ?
      `;

      const [results] = await db.query(query, [company_id]);

      res.status(200).json({ count: results[0].studentCount });
    } catch (err) {
      console.error("Error counting students:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
