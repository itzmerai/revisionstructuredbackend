const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // Login API
  router.post("/", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Check administrator
      const [adminResults] = await db.query(
        "SELECT * FROM administrator WHERE admin_user = ? AND admin_password = ?",
        [username, password]
      );
      if (adminResults.length > 0) {
        const admin = adminResults[0];
        return res.status(200).json({
          message: "Administrator logged in",
          role: "admin",
          user: { admin_id: admin.admin_id, ...admin },
        });
      }

      // Check coordinator
      const [coordinatorResults] = await db.query(
        "SELECT * FROM coordinator WHERE coordinator_user = ? AND coordinator_pass = ?",
        [username, password]
      );
      if (coordinatorResults.length > 0) {
        const coordinator = coordinatorResults[0];
        return res.status(200).json({
          message: "Coordinator logged in",
          role: "coordinator",
          user: {
            coordinator_id: coordinator.coordinator_id,
            ...coordinator,
          },
        });
      }

      // Check company
      const [companyResults] = await db.query(
        "SELECT * FROM company WHERE company_user = ? AND company_password = ?",
        [username, password]
      );
      if (companyResults.length > 0) {
        const company = companyResults[0];
        return res.status(200).json({
          message: "Company logged in",
          role: "company",
          user: { company_id: company.company_id, ...company },
        });
      }

      // If no user found
      res.status(401).json({ message: "Invalid username or password" });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};