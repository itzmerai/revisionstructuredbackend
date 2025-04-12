const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { company_id } = req.query;

    try {
      if (!company_id) {
        return res.status(400).json({ message: "Company ID is required" });
      }

      const query = `
        SELECT 
          t.task_title AS x,
          COUNT(ta.assignment_id) AS y
        FROM task t
        LEFT JOIN task_assingment ta ON t.task_id = ta.task_id
        WHERE t.company_id = ?
        GROUP BY t.task_id
        ORDER BY y DESC
        LIMIT 3
      `;

      const [results] = await db.query(query, [company_id]);
      
      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching task distribution:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};