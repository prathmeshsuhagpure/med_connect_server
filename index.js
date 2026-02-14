require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth_routes");
const userRoutes = require("./routes/user_routes");
const uploadRoutes = require("./routes/upload_routes");
const doctorRoutes = require("./routes/doctor_routes");
const hospitalRoutes = require("./routes/hospital_routes");
const appointmentRoutes = require("./routes/appointment_routes");
const razorpayPaymentRoutes = require("./routes/razorpay_payment_routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect DB
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user', uploadRoutes);
app.use("/api/doctor", doctorRoutes );
app.use("/api/hospital", hospitalRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/payment", razorpayPaymentRoutes);

// Start server const 
PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;