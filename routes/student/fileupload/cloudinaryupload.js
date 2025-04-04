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
    folder: `student_documents/${req.body.student_id}`,
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    resource_type: "auto",
  }),
});

const upload = multer({ storage });

module.exports = (db) => {
  router.post(
    "/",
    upload.single("document"),
    asyncHandler(async (req, res) => {
      try {
        console.log("Request body:", req.body);
        console.log("Uploaded file:", JSON.stringify(req.file, null, 2));

        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const { student_id, remarks } = req.body;

        if (!student_id || !remarks) {
          return res
            .status(400)
            .json({ error: "student_id and remarks are required" });
        }

        const uploadedFileUrl =
          req.file.secure_url || req.file.url || req.file.path;

        if (!uploadedFileUrl) {
          return res
            .status(400)
            .json({ error: "Failed to retrieve file URL from Cloudinary" });
        }

        console.log("Inserting into database:", {
          student_id,
          remarks,
          uploaded_file: uploadedFileUrl,
        });

        const result = await db.query(
          "INSERT INTO document (student_id, remarks, uploaded_file) VALUES (?, ?, ?)",
          [student_id, remarks, uploadedFileUrl]
        );

        console.log("Database insertion result:", result);

        res.status(201).json({
          document_id: result.insertId,
          student_id,
          remarks,
          uploaded_file: uploadedFileUrl,
          date_uploaded: new Date(),
        });
      } catch (error) {
        console.error("Upload error:", error);
        res
          .status(500)
          .json({ error: "Failed to upload file", details: error.message });
      }
    })
  );

  // Add this to your existing documents route file
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      try {
        const { student_id } = req.query;

        if (!student_id) {
          return res.status(400).json({ error: "Student ID is required" });
        }

        const [documents] = await db.query(
          "SELECT document_id, remarks, uploaded_file, date_uploaded FROM document WHERE student_id = ? ORDER BY date_uploaded DESC",
          [student_id]
        );

        res.status(200).json(documents);
      } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ error: "Failed to fetch documents" });
      }
    })
  );

  return router;
};
