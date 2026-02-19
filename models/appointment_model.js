const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
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
      type: String,
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
      required: true,
    },

    cancellationReason: {
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paidOnline", "payAtHospital"],
      default: "unpaid",
    },

    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },

    patientName:{
      type: String,
      required: true,
      trim: true,
    },

    patientPhoneNumber: {
      type: String,
      required: true,
    },

    isFirstVisit: {
      type: Boolean,
      defalut: null,
    },

    patientSymptoms: {
      type: String,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
