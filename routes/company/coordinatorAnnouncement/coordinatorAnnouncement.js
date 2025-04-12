const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    try {
      const { company_id } = req.query;

      if (!company_id) {
        return res.status(400).json({ error: "Missing company ID" });
      }

      const query = `
        SELECT 
          a.announce_id, 
          a.coordinator_id, 
          a.announcement_type, 
          a.announcement_date, 
          a.announcement_content 
        FROM announce a
        INNER JOIN company c ON a.coordinator_id = c.coordinator_id
        WHERE c.company_id = ?
        ORDER BY a.announcement_date DESC;
      `;

      const [results] = await db.query(query, [company_id]);
      res.status(200).json(results);
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Failed to fetch announcements." });
    }
  });

  return router;
};
