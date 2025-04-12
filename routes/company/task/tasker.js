const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // Get students by company ID for dropdown
  router.get("/students", async (req, res) => {
    const { company_id } = req.query;

    try {
      if (!company_id) {
        return res.status(400).json({ error: "Missing company ID" });
      }

      const query = `
        SELECT student_id, student_name 
        FROM student 
        WHERE company_id = ?
      `;

      const [results] = await db.query(query, [company_id]);
      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching students:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  // Get all tasks for a company with assigned students
  router.get("/tasks", async (req, res) => {
    const { company_id } = req.query;
  
    try {
      if (!company_id) {
        return res.status(400).json({ error: "Missing company ID" });
      }
  
      const query = `
        SELECT 
          t.task_id,
          t.task_title,
          t.task_description,
          t.task_created,
          GROUP_CONCAT(s.student_id) as assigned_student_ids,
          GROUP_CONCAT(s.student_name) as assigned_students
        FROM task t
        LEFT JOIN task_assingment ta ON t.task_id = ta.task_id
        LEFT JOIN student s ON ta.student_id = s.student_id
        WHERE t.company_id = ?
        GROUP BY t.task_id
        ORDER BY t.task_created DESC
      `;
  
      const [results] = await db.query(query, [company_id]);
      
      const formattedResults = results.map(task => ({
        task_id: task.task_id,
        task_title: task.task_title,
        task_description: task.task_description,
        task_created: task.task_created,
        assigned_students: task.assigned_students ? task.assigned_students.split(',') : [],
        assigned_student_ids: task.assigned_student_ids ? task.assigned_student_ids.split(',') : []
      }));
  
      res.status(200).json(formattedResults);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });
//update task
router.put("/tasks/:taskId", async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { taskId } = req.params;
    const { task_title, task_description, assigned_students } = req.body;

    // Update task details
    await connection.query(
      `UPDATE task 
       SET task_title = ?, task_description = ?
       WHERE task_id = ?`,
      [task_title, task_description, taskId]
    );

    // Get current assignments
    const [currentAssignments] = await connection.query(
      `SELECT student_id FROM task_assingment WHERE task_id = ?`,
      [taskId]
    );
    const currentStudentIds = currentAssignments.map(a => a.student_id);

    // Determine students to add and remove
    const newStudentIds = assigned_students || [];
    const studentsToAdd = newStudentIds.filter(id => !currentStudentIds.includes(id));
    const studentsToRemove = currentStudentIds.filter(id => !newStudentIds.includes(id));

    // Remove unassigned students
    if (studentsToRemove.length > 0) {
      await connection.query(
        `DELETE FROM task_assingment 
         WHERE task_id = ? AND student_id IN (?)`,
        [taskId, studentsToRemove]
      );
    }

    // Add new assignments
    if (studentsToAdd.length > 0) {
      const assignmentValues = studentsToAdd.map(studentId => [taskId, studentId]);
      await connection.query(
        `INSERT INTO task_assingment (task_id, student_id)
         VALUES ?`,
        [assignmentValues]
      );
    }

    await connection.commit();
    res.status(200).json({ message: "Task updated successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Database error", error: err });
  } finally {
    connection.release();
  }
});

  // Create new task and assignments
  router.post("/tasks", async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      const { company_id, task_title, task_description, assigned_students } = req.body;

      // Validate input
      if (!company_id || !task_title || !task_description) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Insert task
      const [taskResult] = await connection.query(
        `INSERT INTO task 
        (company_id, task_title, task_description, task_created) 
        VALUES (?, ?, ?, NOW())`,
        [company_id, task_title, task_description]
      );

      const taskId = taskResult.insertId;

      // Insert assignments
      if (assigned_students && assigned_students.length > 0) {
        const assignmentValues = assigned_students.map(student_id => [
          taskId,
          student_id
        ]);

        await connection.query(
          `INSERT INTO task_assingment 
          (task_id, student_id) 
          VALUES ?`,
          [assignmentValues]
        );
      }

      await connection.commit();
      res.status(201).json({ 
        message: "Task created successfully",
        task_id: taskId
      });
    } catch (err) {
      await connection.rollback();
      console.error("Error creating task:", err);
      res.status(500).json({ message: "Database error", error: err });
    } finally {
      connection.release();
    }
  });

  router.get("/tasks/:taskId/rate/:studentId", async (req, res) => {
    const { taskId, studentId } = req.params;

    try {
      const query = `
        SELECT task_rating 
        FROM task_assingment 
        WHERE task_id = ? AND student_id = ?
      `;
      const [results] = await db.query(query, [taskId, studentId]);

      if (results.length === 0) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      const currentRating = results[0].task_rating ?? 0;
      res.status(200).json({ rating: currentRating });
    } catch (err) {
      console.error("Error fetching current rating:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  // Update rating
  router.put("/tasks/:taskId/rate", async (req, res) => {
    const { taskId } = req.params;
    const { student_id, rating } = req.body;

    try {
      if (isNaN(rating) || rating < 0 || rating > 100) {
        return res.status(400).json({ error: "Rating must be between 0 and 100" });
      }

      const query = `
        UPDATE task_assingment 
        SET task_rating = ?
        WHERE task_id = ? AND student_id = ?
      `;
      await db.query(query, [rating, taskId, student_id]);

      res.status(200).json({ message: "Rating updated successfully" });
    } catch (err) {
      console.error("Error updating rating:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });


  return router;
};