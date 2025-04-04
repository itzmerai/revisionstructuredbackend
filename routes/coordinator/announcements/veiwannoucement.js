const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    try {
      const coordinator_id = req.query.coordinator_id;
      const query = `
                SELECT announce_id, coordinator_id, announcement_type, announcement_content 
                FROM announce 
                WHERE coordinator_id = ?`;

      // Execute query and destructure results from array
      const [results] = await db.query(query, [coordinator_id]);
      res.status(200).json(results);
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Failed to fetch announcements." });
    }
  });

  return router;
};
