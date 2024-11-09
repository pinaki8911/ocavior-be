const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Employee = require("../models/Employee");
const multer = require("multer");
const path = require("path");

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// AWS S3 client setup
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Employee submission handler
const submitEmployeeForm = async (req, res) => {
  try {
    const { firstName, lastName, email, position, ExpSkill } = req.body;
    const file = req.file;

    if (!file) return res.status(400).send("Resume file is required.");

    // Upload the resume to S3
    const fileName = `${email}_${Date.now()}${path.extname(file.originalname)}`;
    let resumeUrl;

    try {
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      // Generate the S3 URL
      resumeUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (uploadError) {
      console.error("Error uploading file to S3:", uploadError);
      return res.status(500).json({ error: "Failed to upload resume file" });
    }

    // Save employee details to the database
    try {
      const newEmployee = new Employee({
        firstName,
        lastName,
        email,
        position,
        ExpSkill,
        resumeUrl,
      });
      await newEmployee.save();

      res.status(200).json({
        message: "Employee form submitted successfully",
        data: newEmployee,
      });
    } catch (dbError) {
      console.error("Error saving employee details to database:", dbError);
      res.status(500).json({ error: "Failed to save employee data" });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

module.exports = { submitEmployeeForm, upload };
