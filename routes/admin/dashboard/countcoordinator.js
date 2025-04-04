const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    try {
      const query =
        "SELECT COUNT(DISTINCT coordinator_id) AS count FROM coordinator";
      const [results] = await db.query(query);

      // Log result for debugging
      console.log("Unique Coordinators Count:", results[0].count);

      // Send the count of unique coordinators
      res.status(200).json({ count: results[0].count });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
