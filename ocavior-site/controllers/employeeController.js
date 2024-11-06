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

    await blockBlobClient.uploadData(file.buffer);
    const resumeUrl = blockBlobClient.url;

    // Save employee details to the database
    const newEmployee = new Employee({
      firstName,
      lastName,
      email,
      position,
      ExpSkill,
      resumeUrl,
    });

    await newEmployee.save();

    res.status(201).json({
      message: "Employee form submitted successfully",
      data: newEmployee,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { submitEmployeeForm, upload };
