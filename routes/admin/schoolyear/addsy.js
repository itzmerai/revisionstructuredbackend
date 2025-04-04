const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const { admin_id, school_yr } = req.body;

    try {
      // Validate input
      if (!admin_id || !school_yr) {
        return res.status(400).json({ message: "All fields are required." });
      }

      // Check if school year already exists
      const checkQuery = `SELECT * FROM school_year WHERE school_yr = ?`;
      const [results] = await db.query(checkQuery, [school_yr]);

      if (results.length > 0) {
        return res.status(400).json({ message: "School year already exists." });
      }

      // Insert new school year
      const insertQuery = `INSERT INTO school_year (admin_id, school_yr) VALUES (?, ?)`;
      const [result] = await db.query(insertQuery, [admin_id, school_yr]);

      res.status(201).json({
        message: "School year added successfully",
        year_id: result.insertId,
      });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
