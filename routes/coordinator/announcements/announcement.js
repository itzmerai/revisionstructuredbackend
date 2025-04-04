const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const { coordinator_id, announcement_type, announcement_content } =
      req.body;

    try {
      // Validate required fields
      if (!coordinator_id || !announcement_type || !announcement_content) {
        return res.status(400).json({ error: "All fields are required." });
      }

      const query = `
        INSERT INTO announce 
        (coordinator_id, announcement_type, announcement_content) 
        VALUES (?, ?, ?)
      `;
      const [results] = await db.query(query, [
        coordinator_id,
        announcement_type,
        announcement_content,
      ]);

      res.status(201).json({
        message: "Announcement created successfully.",
        announce_id: results.insertId,
      });
    } catch (err) {
      console.error("Error creating announcement:", err);
      res.status(500).json({ error: "Failed to create announcement." });
    }
  });

  return router;
};
