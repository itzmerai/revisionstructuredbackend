const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    try {
      const query = `SELECT program_id, program_name, program_description, program_hours FROM program`;
      const [results] = await db.query(query);

      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching programs:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
