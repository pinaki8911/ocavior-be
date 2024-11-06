const express = require("express");
const {
  submitEmployeeForm,
  upload,
} = require("../controllers/employeeController");

const router = express.Router();

router.post("/submit", upload.single("resume"), submitEmployeeForm);

module.exports = router;
