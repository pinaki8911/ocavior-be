const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: false },
  position: String,
  ExpSkill: String,
  resumeUrl: String,
});

module.exports = mongoose.model("Employee", employeeSchema);
