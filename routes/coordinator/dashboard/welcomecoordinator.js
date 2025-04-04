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
        SELECT coordinator_firstname, coordinator_lastname, coordinator_sex
        FROM coordinator
        WHERE coordinator_id = ?
      `;

      const [results] = await db.query(query, [coordinator_id]);

      if (results.length === 0) {
        return res.status(404).json({ message: "Coordinator not found" });
      }

      const { coordinator_firstname, coordinator_lastname, coordinator_sex  } = results[0];
      res.status(200).json({
        fullName: `${coordinator_firstname} ${coordinator_lastname}`,
        gender: coordinator_sex
      });
    } catch (err) {
      console.error("Error fetching coordinator details:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
