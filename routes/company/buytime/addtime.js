const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const { student_id, hours_added } = req.body;

    try {
      if (!student_id || !hours_added) {
        return res.status(400).json({ error: "Student ID and hours are required" });
      }

      const [statusResult] = await db.query(
        "SELECT rendered_time, remaining_time FROM ojt_status WHERE student_id = ?",
        [student_id]
      );

      if (statusResult.length === 0) {
        return res.status(404).json({ error: "Student not found in OJT status" });
      }

      let { rendered_time, remaining_time } = statusResult[0];

      rendered_time = parseFloat(rendered_time) + parseFloat(hours_added);
      remaining_time = Math.max(parseFloat(remaining_time) - parseFloat(hours_added), 0);
      const time_status = remaining_time === 0 ? "Completed" : "Ongoing";

      await db.query(
        "UPDATE ojt_status SET rendered_time = ?, remaining_time = ?, time_status = ? WHERE student_id = ?",
        [rendered_time, remaining_time, time_status, student_id]
      );

      if (remaining_time === 0) {
        await db.query("UPDATE student SET student_status = 'Inactive' WHERE student_id = ?", [student_id]);
      }

      res.json({
        message: "Time added successfully",
        student_id,
        updated_rendered_time: rendered_time,
        updated_remaining_time: remaining_time,
        time_status,
      });
    } catch (err) {
      console.error("Error adding time:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};
