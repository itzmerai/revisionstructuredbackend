const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const { student_schoolid, student_password } = req.body;

    if (!student_schoolid || !student_password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    try {
      const [results] = await db.query(
        "SELECT * FROM student WHERE student_schoolid = ? AND student_password = ?",
        [student_schoolid, student_password]
      );

      if (results.length > 0) {
        const student = results[0];
        return res.status(200).json({
          message: "Student logged in successfully",
          student_id: student.student_id,
          student_name: student.student_name,
          // Add any other fields you want to return
        });
      } else {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }
    } catch (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ message: "Database error", error: err.message });
    }
  });

  return router;
};
