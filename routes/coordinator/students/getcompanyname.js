const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const coordinator_id = req.query.coordinator_id;

    try {
      const query = `SELECT company_id, company_name FROM company WHERE coordinator_id = ?`;
      const [results] = await db.query(query, [coordinator_id]);

      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching companies:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
