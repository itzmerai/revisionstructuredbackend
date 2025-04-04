const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.put("/:program_id", async (req, res) => {
    const { program_id } = req.params;
    const { admin_id, program_name, program_description, program_hours } =
      req.body;

    try {
      // Validate required fields
      if (
        !admin_id ||
        !program_name ||
        !program_description ||
        !program_hours
      ) {
        return res.status(400).json({ message: "All fields are required." });
      }

      // Check if another program with the same name AND description already exists (excluding the current program)
      const checkQuery = `
        SELECT * FROM program 
        WHERE program_name = ? AND program_description = ?
        AND program_id != ?
      `;
      const [checkResult] = await db.query(checkQuery, [
        program_name,
        program_description,
        program_id,
      ]);

      if (checkResult.length > 0) {
        return res.status(400).json({
          message:
            "A program with the same name and description already exists.",
        });
      }

      // If no duplicate, proceed to update
      const updateQuery = `
        UPDATE program 
        SET admin_id = ?, program_name = ?, program_description = ?, program_hours = ?
        WHERE program_id = ?
      `;
      const [result] = await db.query(updateQuery, [
        admin_id,
        program_name,
        program_description,
        program_hours,
        program_id,
      ]);

      res
        .status(200)
        .json({ message: "Program updated successfully", program_id });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
