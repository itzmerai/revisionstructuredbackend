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

      // Check student
      const [studentResults] = await db.query(
        "SELECT * FROM student WHERE student_schoolid = ? AND student_password = ?",
        [username, password]
      );
      if (studentResults.length > 0) {
        const student = studentResults[0];
        return res.status(200).json({
          message: "Student logged in",
          role: "student",
          user: { student_id: student.student_id, ...student },
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
