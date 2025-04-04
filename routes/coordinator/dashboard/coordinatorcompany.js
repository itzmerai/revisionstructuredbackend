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
        SELECT COUNT(DISTINCT company_id) AS companyCount
        FROM company
        WHERE coordinator_id = ?
      `;

      const [results] = await db.query(query, [coordinator_id]);

      res.status(200).json({ count: results[0].companyCount });
    } catch (err) {
      console.error("Error counting companies:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
