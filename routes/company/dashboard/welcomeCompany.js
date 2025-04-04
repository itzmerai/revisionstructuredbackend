const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { company_id } = req.query;

    try {
      // Validate company_id
      if (!company_id) {
        return res.status(400).json({ message: "Company ID is required" });
      }

      const query = `
        SELECT company_mentor
        FROM company
        WHERE company_id = ?
      `;

      const [results] = await db.query(query, [company_id]);

      if (results.length === 0) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.status(200).json({ company_mentor: results[0].company_mentor });
    } catch (err) {
      console.error("Error fetching company mentor:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
