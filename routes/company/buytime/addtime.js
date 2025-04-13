const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const { student_id, hours_added } = req.body;

    try {
      // Input validation
      if (!student_id || !hours_added) {
        return res.status(400).json({ error: "Student ID and hours are required" });
      }

      const hoursToAdd = parseFloat(hours_added);
      if (isNaN(hoursToAdd)) {
        return res.status(400).json({ error: "Invalid hours value" });
      }

      // Get program hours
      const [programQuery] = await db.query(`
        SELECT p.program_hours 
        FROM student s
        JOIN coordinator c ON s.coordinator_id = c.coordinator_id
        JOIN program p ON c.program_id = p.program_id
        WHERE s.student_id = ?
      `, [student_id]);

      if (programQuery.length === 0) {
        return res.status(404).json({ error: "Student program not found" });
      }

      const programHours = parseFloat(programQuery[0].program_hours);

      // Check existing OJT status
      const [statusResult] = await db.query(
        "SELECT * FROM ojt_status WHERE student_id = ?",
        [student_id]
      );

      let renderedTime, remainingTime, timeStatus;

      if (statusResult.length === 0) {
        // New record validation
        if (hoursToAdd <= 0) {
          return res.status(400).json({ error: "Hours must be greater than 0" });
        }
        if (hoursToAdd > programHours) {
          return res.status(400).json({ 
            error: `Cannot add more hours than program requirement (${programHours}hrs)` 
          });
        }

        renderedTime = hoursToAdd;
        remainingTime = programHours - hoursToAdd;
        timeStatus = remainingTime <= 0 ? "Completed" : "Ongoing";

        await db.query(
          "INSERT INTO ojt_status (student_id, rendered_time, remaining_time, time_status) VALUES (?, ?, ?, ?)",
          [student_id, renderedTime, remainingTime, timeStatus]
        );
      } else {
        // Existing record
        const currentRendered = parseFloat(statusResult[0].rendered_time);
        const currentRemaining = parseFloat(statusResult[0].remaining_time);

        if (currentRemaining <= 0) {
          return res.status(400).json({ error: "No remaining time left" });
        }
        if (hoursToAdd <= 0) {
          return res.status(400).json({ error: "Hours must be greater than 0" });
        }
        if (hoursToAdd > currentRemaining) {
          return res.status(400).json({ 
            error: `Cannot add more hours than remaining time (${currentRemaining}hrs)` 
          });
        }

        renderedTime = currentRendered + hoursToAdd;
        remainingTime = currentRemaining - hoursToAdd;
        timeStatus = remainingTime <= 0 ? "Completed" : "Ongoing";

        await db.query(
          "UPDATE ojt_status SET rendered_time = ?, remaining_time = ?, time_status = ? WHERE student_id = ?",
          [renderedTime, remainingTime, timeStatus, student_id]
        );
      }

      // Update student status if completed
      if (remainingTime <= 0) {
        await db.query(
          "UPDATE student SET student_status = 'Inactive' WHERE student_id = ?",
          [student_id]
        );
      }

      res.json({
        success: true,
        message: "Time added successfully",
        student_id,
        rendered_time: renderedTime,
        remaining_time: remainingTime,
        time_status: timeStatus
      });

    } catch (err) {
      console.error("Error adding time:", err);
      res.status(500).json({ 
        success: false,
        error: "Internal server error",
        details: err.message 
      });
    }
  });

  return router;
};
