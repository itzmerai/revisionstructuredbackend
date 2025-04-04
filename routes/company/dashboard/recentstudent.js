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
        SELECT s.student_schoolid, s.student_name
        FROM student s
        WHERE s.company_id = ?
        ORDER BY s.student_id DESC
        LIMIT 5
      `;

      const [results] = await db.query(query, [company_id]);

      res.status(200).json({ recentStudents: results });
    } catch (err) {
      console.error("Error fetching recently added students:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
