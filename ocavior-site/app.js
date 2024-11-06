require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();
app.use(express.json());
console.log(process.env.FRONTEND_ORIGIN);
app.use(cors({ origin: process.env.FRONTEND_ORIGIN }));
app.use("/api/employees", employeeRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((error) => console.log("Database connection error:", error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
