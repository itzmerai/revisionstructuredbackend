const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({ message: "Missing student_id parameter." });
    }

    try {
      // Fetch student details
      const [studentRows] = await db.query(
        `SELECT student_name, coordinator_id, student_sex 
         FROM student 
         WHERE student_id = ?`,
        [student_id]
      );

      if (studentRows.length === 0) {
        return res.status(404).json({ message: "Student not found." });
      }

      const { student_name, coordinator_id, student_sex } = studentRows[0];
      const firstName = student_name.split(" ")[0];

      // Fetch coordinator details
      const [coordinatorRows] = await db.query(
        `SELECT program_id 
         FROM coordinator 
         WHERE coordinator_id = ?`,
        [coordinator_id]
      );

      if (coordinatorRows.length === 0) {
        return res.status(404).json({ message: "Coordinator not found." });
      }

      const { program_id } = coordinatorRows[0];

      // Fetch program details
      const [programRows] = await db.query(
        `SELECT program_hours 
         FROM program 
         WHERE program_id = ?`,
        [program_id]
      );

      if (programRows.length === 0) {
        return res.status(404).json({ message: "Program not found." });
      }

      const { program_hours } = programRows[0];

      // Get OJT status
      const [ojtStatusRows] = await db.query(
        `SELECT rendered_time, remaining_time 
         FROM ojt_status 
         WHERE student_id = ?`,
        [student_id]
      );

      // Process times
      let renderedTime = 0;
      let remainingTime = 0;

      if (ojtStatusRows.length > 0) {
        renderedTime = Number(ojtStatusRows[0].rendered_time) || 0;
        remainingTime = Number(ojtStatusRows[0].remaining_time) || 0;
      }

      res.json({
        studentDetails: {
          firstName,
          renderedTime: renderedTime.toFixed(2),
          remainingTime: remainingTime.toFixed(2),
          requiredTime: program_hours,
          studentSex: student_sex,
        },
      });
    } catch (error) {
      console.error("Error fetching student details:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });

  return router;
};
