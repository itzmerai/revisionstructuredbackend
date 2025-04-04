const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { student_id } = req.query;

    // Validate student_id
    if (!student_id) {
      return res.status(400).json({ error: "Missing student_id parameter." });
    }

    try {
      // Fetch timesheet entries for the student
      const [timesheetEntries] = await db.query(
        `SELECT time_id, student_id, company_id, date, 
                am_in, am_out, pm_in, pm_out, location, dailyrenderedtime 
         FROM timesheet 
         WHERE student_id = ?`,
        [student_id]
      );

      // Handle case where no timesheet entries are found
      if (timesheetEntries.length === 0) {
        return res.status(404).json({ error: "No timesheet entries found." });
      }

      // Process each timesheet entry
      const processedTimesheet = timesheetEntries.map((entry) => {
        return {
          date: entry.date,
          location: entry.location,
          morning: {
            in: entry.am_in || "-",
            out: entry.am_out || "-",
          },
          afternoon: {
            in: entry.pm_in || "-",
            out: entry.pm_out || "-",
          },
          totalHours: entry.dailyrenderedtime || 0, // Default to 0 if null
        };
      });

      // Return the processed timesheet data
      res.json({ timesheet: processedTimesheet });
    } catch (error) {
      console.error("Error fetching timesheet:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });

  return router;
};
