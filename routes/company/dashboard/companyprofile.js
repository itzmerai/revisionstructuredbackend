const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // Get company profile
  router.get("/", async (req, res) => {
    const { company_id } = req.query;

    try {
      if (!company_id) {
        return res.status(400).json({ message: "Company ID is required" });
      }

      const query = `
        SELECT 
          company_name AS name,
          company_address AS address,
          company_description AS description,
          company_mentor AS supervisorName,
          company_contact AS contactNo,
          company_email AS email
        FROM company
        WHERE company_id = ?
      `;

      const [results] = await db.query(query, [company_id]);
      
      if (results.length === 0) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.status(200).json(results[0]);
    } catch (err) {
      console.error("Error fetching company profile:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  // Update company profile
  router.put("/", async (req, res) => {
    const { company_id } = req.query;
    const updatedFields = req.body;

    try {
      if (!company_id) {
        return res.status(400).json({ message: "Company ID is required" });
      }

      const query = `
        UPDATE company SET
          company_name = ?,
          company_address = ?,
          company_description = ?,
          company_mentor = ?,
          company_contact = ?,
          company_email = ?
        WHERE company_id = ?
      `;

      const params = [
        updatedFields.name,
        updatedFields.address,
        updatedFields.description,
        updatedFields.supervisorName,
        updatedFields.contactNo,
        updatedFields.email,
        company_id
      ];

      const [result] = await db.query(query, params);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
      console.error("Error updating company profile:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};