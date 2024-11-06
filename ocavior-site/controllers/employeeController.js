const { BlobServiceClient } = require("@azure/storage-blob");
const Employee = require("../models/Employee");
const multer = require("multer");
const path = require("path");

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Azure Blob Storage client setup
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

// Employee submission handler
const submitEmployeeForm = async (req, res) => {
  try {
    const { firstName, lastName, email, position, ExpSkill } = req.body;
    const file = req.file;

    if (!file) return res.status(400).send("Resume file is required.");

    // Upload the resume to Azure Blob
    const blobName = `${email}_${Date.now()}${path.extname(file.originalname)}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    let resumeUrl;

    try {
      await blockBlobClient.uploadData(file.buffer);
      resumeUrl = blockBlobClient.url;
    } catch (uploadError) {
      console.error("Error uploading file to Azure Blob:", uploadError);
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
