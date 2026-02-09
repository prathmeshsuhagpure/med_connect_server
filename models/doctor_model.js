const mongoose = require("mongoose");
const createBaseUserSchema = require("./base_user_model");

const doctorSchema = createBaseUserSchema();

// Add doctor-specific fields
doctorSchema.add({
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
});

// Set default role for doctors
doctorSchema.pre('validate', function(next) {
  if (!this.role) {
    this.role = 'doctor';
  }
  next();
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
  };
};

// Helper methods
doctorSchema.methods.getVerificationStatus = function() {
  return this.isVerified ? 'Verified' : 'Pending Verification';
};

doctorSchema.methods.getDisplayName = function() {
  return `Dr. ${this.name}`;
};

// Create model with collection name 'doctors'
const Doctor = mongoose.model('Doctor', doctorSchema, 'doctors');

module.exports = Doctor;