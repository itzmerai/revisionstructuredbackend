const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    try {
      const query = `
        SELECT 
          c.coordinator_id, 
          c.coordinator_firstname, 
          c.coordinator_midname,
          c.coordinator_lastname, 
          c.coordinator_contact,
          c.coordinator_sex, 
          c.coordinator_email,
          c.coordinator_user, 
          c.coordinator_pass, 
          p.program_name  -- Fetch program_name from the program table
        FROM 
          coordinator c
        JOIN 
          program p ON c.program_id = p.program_id; -- Join condition on program_id
      `;

      const [results] = await db.query(query);
      res.status(200).json(results);
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
