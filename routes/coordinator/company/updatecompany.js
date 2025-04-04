const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.put("/:company_id", async (req, res) => {
    const { company_id } = req.params;
    const {
      company_name,
      company_address,
      company_mentor,
      company_contact,
      company_description,
      company_email
    } = req.body;

    try {
      // Validate input
      if (
        !company_name ||
        !company_address ||
        !company_mentor ||
        !company_contact ||
        !company_description ||
        !company_email
      ) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const query = `
        UPDATE company 
        SET 
          company_name = ?, 
          company_address = ?, 
          company_mentor = ?, 
          company_contact = ?, 
          company_description = ?, 
          company_email = ?
        WHERE company_id = ?
      `;

      const [result] = await db.query(query, [
        company_name,
        company_address,
        company_mentor,
        company_contact,
        company_description,
        company_email,
        company_id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.status(200).json({ message: "Company updated successfully" });
    } catch (err) {
      console.error("Error updating company:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
