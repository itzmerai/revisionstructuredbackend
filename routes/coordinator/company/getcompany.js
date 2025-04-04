const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { coordinator_id } = req.query; // Get coordinator_id from the request query

    try {
      // Query to filter companies by coordinator_id
      const query = `
        SELECT 
          company_id, 
          coordinator_id, 
          company_name, 
          company_address, 
          company_mentor, 
          company_contact 
        FROM company 
        WHERE coordinator_id = ?
      `;

      const [results] = await db.query(query, [coordinator_id]);

      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching companies:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
