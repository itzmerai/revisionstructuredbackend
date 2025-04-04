const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    try {
      const query = "SELECT COUNT(*) AS count FROM student";
      const [results] = await db.query(query);

      res.json({ count: results[0].count });
    } catch (err) {
      console.error("Error fetching total students:", err);
      res.status(500).json({ error: "Failed to fetch total students" });
    }
  });

  return router;
};
