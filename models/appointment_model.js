const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },

    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },

    hospitalAddress: {
      type: String,
      required: true,
      trim: true,
    },

    doctorName: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    appointmentTime: {
      type: String, // "10:30 AM"
      required: true,
    },

    status: {
      type: String,
      enum: [
        "confirmed",
        "pending",
        "completed",
        "cancelledByPatient",
        "cancelledByHospital",
      ],
      default: "pending",
    },

    appointmentType: {
      type: String,
      enum: ["In-Person", "Video Consultation"],
      required: true,
    },

    cancellationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
