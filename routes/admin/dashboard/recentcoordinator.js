const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    try {
      const query = `
        SELECT 
          c.coordinator_id AS id,
          CONCAT(c.coordinator_firstname, ' ', c.coordinator_lastname) AS name,
          p.program_name AS programName
        FROM 
          coordinator c
        JOIN 
          program p ON c.program_id = p.program_id
        ORDER BY 
          c.coordinator_id DESC
        LIMIT 5;
      `;

      const [results] = await db.query(query);
      res.status(200).json({ recentCoordinators: results });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
