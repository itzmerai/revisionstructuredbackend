const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const { admin_id, program_name, program_description, program_hours } =
      req.body;

    try {
      // Check if a program with the same name AND description already exists
      const checkQuery = `
        SELECT * FROM program 
        WHERE program_name = ? AND program_description = ?
      `;
      const [checkResult] = await db.query(checkQuery, [
        program_name,
        program_description,
      ]);

      if (checkResult.length > 0) {
        return res.status(400).json({
          message: "Program with the same name and description already exists",
        });
      }

      // If no duplicate, proceed to insert
      const insertQuery = `
        INSERT INTO program (admin_id, program_name, program_description, program_hours)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await db.query(insertQuery, [
        admin_id,
        program_name,
        program_description,
        program_hours,
      ]);

      res.status(201).json({
        message: "Program added successfully",
        program_id: result.insertId,
      });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Database error" });
    }
  });

  return router;
};
