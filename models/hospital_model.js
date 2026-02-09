const mongoose = require("mongoose");
const createBaseUserSchema = require("./base_user_model");

const hospitalSchema = createBaseUserSchema();

// Add hospital-specific fields
hospitalSchema.add({
  hospitalName: {
    type: String,
    default: null,
  },
  registrationNumber: {
    type: String,
    default: null,
  },
  licenseNumber: {
    type: String,
    default: null,
  },
  specialties: {
    type: String,
    default: null,
  },
  facilities: {
    type: String,
    default: null,
  },
  operatingHours: {
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

// Set default role for hospitals
hospitalSchema.pre('validate', async function() {
  if (!this.role) {
    this.role = 'hospital';
  }
});

// Method to get hospital-specific data
hospitalSchema.methods.getRoleData = function () {
  const baseData = this.getBaseData();
  return {
    ...baseData,
    hospitalName: this.hospitalName,
    registrationNumber: this.registrationNumber,
    licenseNumber: this.licenseNumber,
    specialties: this.specialties,
    facilities: this.facilities,
    operatingHours: this.operatingHours,
    rating: this.rating,
    totalReviews: this.totalReviews,
  };
};

// Helper methods
hospitalSchema.methods.hasCompleteProfile = function() {
  return !!(this.hospitalName && this.registrationNumber && this.address);
};

hospitalSchema.methods.getVerificationStatus = function() {
  return this.isVerified ? 'Verified' : 'Pending Verification';
};

hospitalSchema.methods.getDisplayName = function() {
  return this.hospitalName || this.name;
};

// Create model with collection name 'hospitals'
const Hospital = mongoose.model('Hospital', hospitalSchema, 'hospitals');

module.exports = Hospital;