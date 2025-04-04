const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({ error: "Missing student_id parameter." });
    }

    try {
      const [studentResult] = await db
        .promise()
        .query("SELECT coordinator_id FROM student WHERE student_id = ?", [
          student_id,
        ]);

      if (studentResult.length === 0) {
        return res.status(404).json({ error: "Student not found." });
      }

      const { coordinator_id } = studentResult[0];

      const [announcementResult] = await db
        .promise()
        .query(
          "SELECT announce_id, announcement_type, announcement_date, announcement_content " +
            "FROM announce WHERE coordinator_id = ? ORDER BY announce_id DESC",
          [coordinator_id]
        );

      if (announcementResult.length === 0) {
        return res.status(200).json({ announcements: [] }); // Return empty array instead of error
      }

      res.json({ announcements: announcementResult });
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });
  return router;
};
