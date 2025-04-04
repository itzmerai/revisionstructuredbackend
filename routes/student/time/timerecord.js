const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const { studentId, scanTime, address } = req.body;

    if (!studentId || !scanTime || !address) {
      return res.status(400).json({ error: "Student ID, scan time, and address are required" });
    }

    try {
      const [studentResult] = await db.query(
        "SELECT company_id, coordinator_id FROM student WHERE student_id = ?",
        [studentId]
      );

      if (studentResult.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      const { company_id, coordinator_id } = studentResult[0];
      if (!company_id) {
        return res.status(400).json({ error: "Student company not assigned" });
      }

      const scanDate = new Date(scanTime);
      scanDate.setHours(scanDate.getHours() + 8);
      const date = scanDate.toISOString().split("T")[0];
      const time = scanDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });

      const [timesheetRows] = await db.query(
        "SELECT * FROM timesheet WHERE student_id = ? AND date = ?",
        [studentId, date]
      );

      if (timesheetRows.length > 0) {
        const timesheetEntry = timesheetRows[0];
        const updatedFields = {};

        if (!timesheetEntry.am_in) updatedFields.am_in = time;
        else if (!timesheetEntry.am_out) updatedFields.am_out = time;
        else if (!timesheetEntry.pm_in) updatedFields.pm_in = time;
        else if (!timesheetEntry.pm_out) updatedFields.pm_out = time;
        else return res.status(400).json({ error: "All time slots for the day are filled" });

        await db.query("UPDATE timesheet SET ? WHERE time_id = ?", [updatedFields, timesheetEntry.time_id]);
      } else {
        await db.query(
          "INSERT INTO timesheet (student_id, company_id, date, am_in, location, dailyrenderedtime) VALUES (?, ?, ?, ?, ?, ?)",
          [studentId, company_id, date, time, address, 0]
        );
      }

      const [updatedTimesheet] = await db.query(
        "SELECT * FROM timesheet WHERE student_id = ? AND date = ?",
        [studentId, date]
      );

      if (updatedTimesheet.length > 0) {
        const entry = updatedTimesheet[0];

        const parseTimeToDecimal = (time) => {
          if (!time || typeof time !== "string") return null;
          const [timePart, modifier] = time.split(" ");
          let [hours, minutes] = timePart.split(":").map(Number);

          if (hours === 12 && modifier === "AM") hours = 0;
          if (modifier === "PM" && hours !== 12) hours += 12;

          return hours + minutes / 60;
        };

        const calculateRenderedHours = (inTime, outTime) => {
          const inDecimal = parseTimeToDecimal(inTime);
          const outDecimal = parseTimeToDecimal(outTime);
          if (inDecimal === null || outDecimal === null || inDecimal >= outDecimal) return 0;
          return outDecimal - inDecimal;
        };

        const morningHours = calculateRenderedHours(entry.am_in, entry.am_out);
        const afternoonHours = calculateRenderedHours(entry.pm_in, entry.pm_out);
        const totalHours = (morningHours + afternoonHours).toFixed(2);

        await db.query("UPDATE timesheet SET dailyrenderedtime = ? WHERE time_id = ?", [totalHours, entry.time_id]);

        const [statusResult] = await db.query(
          "SELECT rendered_time FROM ojt_status WHERE student_id = ?",
          [studentId]
        );

        const previousRenderedTime = statusResult.length > 0 ? parseFloat(statusResult[0].rendered_time) : 0;
        const newRenderedTime = previousRenderedTime + parseFloat(totalHours);

        const [programResult] = await db.query(
          "SELECT program_hours FROM program WHERE program_id = (SELECT program_id FROM coordinator WHERE coordinator_id = ?)",
          [coordinator_id]
        );

        if (programResult.length === 0) {
          return res.status(400).json({ error: "Program not found" });
        }

        const programHours = programResult[0].program_hours;
        const remainingTime = programHours - newRenderedTime;
        const timeStatus = remainingTime <= 0 ? "Completed" : "Ongoing";

        await db.query(
          "UPDATE ojt_status SET rendered_time = ?, remaining_time = ?, time_status = ? WHERE student_id = ?",
          [newRenderedTime, remainingTime, timeStatus, studentId]
        );

        if (timeStatus === "Completed" || remainingTime <= 0) {
          await db.query("UPDATE student SET student_status = 'Inactive' WHERE student_id = ?", [studentId]);
        }
      }

      res.json({ message: "Timesheet updated successfully" });
    } catch (err) {
      console.error("Error processing timesheet scan:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};
