const mongoose = require("mongoose");
const createBaseUserSchema = require("./base_user_model");

const doctorSchema = createBaseUserSchema();

doctorSchema.add({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  specialization: {
    type: String,
    default: null,
  },
  qualification: {
    type: String,
    default: null,
  },
  licenseNumber: {
    type: String,
    default: null,
  },
  experience: {
    type: String,
    default: null,
  },
  hospitalAffiliation: {
    type: String,
    default: null,
  },
  consultationFee: {
    type: String,
    default: null,
  },
  availableHours: {
    type: String,
    default: null,
  },
  rating: {
    type: Number,
    default: null,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  department: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
});

// Set default role for doctors
doctorSchema.pre('validate', async function () {
  if (!this.role) {
    this.role = 'doctor';
  }
});

// Method to get doctor-specific data
doctorSchema.methods.getRoleData = function () {
  const baseData = this.getBaseData();
  return {
    ...baseData,
    specialization: this.specialization,
    qualification: this.qualification,
    licenseNumber: this.licenseNumber,
    experience: this.experience,
    hospitalAffiliation: this.hospitalAffiliation,
    consultationFee: this.consultationFee,
    availableHours: this.availableHours,
    rating: this.rating,
    totalReviews: this.totalReviews,
    department: this.department,
    isAvailable: this.isAvailable,
  };
};

// Helper methods
doctorSchema.methods.getVerificationStatus = function () {
  return this.isVerified ? 'Verified' : 'Pending Verification';
};


const Doctor = mongoose.model('Doctor', doctorSchema, 'doctors');

module.exports = Doctor;