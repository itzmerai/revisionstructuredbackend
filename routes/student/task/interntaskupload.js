const express = require("express");
const router = express.Router();
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../../../cloudinary");
require("dotenv").config();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => ({
      folder: `student_taskdocuments/${req.body.student_id}`,
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      resource_type: "auto",
      format: "png", // Force specific format if needed
    }),
  });
  
  const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });
  
  module.exports = (db) => {
    router.post(
      "/",
      upload.single("document"),
      asyncHandler(async (req, res) => {
        try {
          // Verify Cloudinary upload results
          if (!req.file || !req.file.path) {
            console.error('Cloudinary upload failed:', req.file);
            return res.status(400).json({ 
              error: "File upload to Cloudinary failed",
              details: req.file 
            });
          }
  
          // Destructure required fields
          const { student_id, task_id, remarks } = req.body;
          
          // Validate all required fields
          const missingFields = [];
          if (!student_id) missingFields.push("student_id");
          if (!task_id) missingFields.push("task_id");
          if (!remarks) missingFields.push("remarks");
          
          if (missingFields.length > 0) {
            return res.status(400).json({
              error: "Missing required fields",
              missing: missingFields
            });
          }
  
          // Get Cloudinary URL from successful upload
          const cloudinaryUrl = req.file.path;
          console.log('Cloudinary URL:', cloudinaryUrl);
  
          // Database insertion
          const [result] = await db.query(
            `INSERT INTO uploaded_task 
            (task_id, student_id, remarks, uploaded_taskdocument)
            VALUES (?, ?, ?, ?)`,
            [task_id, student_id, remarks, cloudinaryUrl]
          );
  
          // Successful response
          res.status(201).json({
            success: true,
            uploaded_task_id: result.insertId,
            document_url: cloudinaryUrl,
            task_id,
            student_id,
            remarks
          });
  
        } catch (error) {
          console.error("Full upload error:", {
            message: error.message,
            stack: error.stack,
            body: req.body,
            file: req.file
          });
          
          res.status(500).json({
            error: "Upload failed",
            details: error.message,
            code: error.code
          });
        }
      })
    );
  
// In your backend route file
router.get(
    "/history",
    asyncHandler(async (req, res) => {
      try {
        const { student_id, task_id } = req.query;
  
        if (!student_id || !task_id) {
          return res.status(400).json({
            error: "Student ID and Task ID are required",
          });
        }
  
        console.log(`Fetching history for student ${student_id}, task ${task_id}`); // Debug log
  
        const [documents] = await db.query(
          `SELECT 
            uploaded_task_id,
            remarks,
            uploaded_taskdocument,
            DATE_FORMAT(uploaded_taskdate, '%Y-%m-%d %H:%i:%s') AS uploaded_date
          FROM uploaded_task 
          WHERE student_id = ? AND task_id = ?
          ORDER BY uploaded_taskdate DESC`,
          [student_id, task_id]
        );
  
        console.log('Found documents:', documents); // Debug log
  
        res.status(200).json(documents);
      } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ 
          error: "Failed to fetch task history",
          details: error.message 
        });
      }
    })
  );

  return router;
};