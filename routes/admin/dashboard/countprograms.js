const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    try {
      const query = `SELECT COUNT(DISTINCT program_id) AS count FROM program`;
      const [results] = await db.query(query);

      res.status(200).json({ count: results[0].count });
    } catch (err) {
      console.error("Error counting programs:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
