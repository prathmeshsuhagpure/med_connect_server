const mongoose = require("mongoose");
const createBaseUserSchema = require("./base_user_model");

const hospitalSchema = createBaseUserSchema();

// ---------------- Hospital Specific Fields ----------------
hospitalSchema.add({
  hospitalName: {
    type: String,
    trim: true,
    default: null,
  },

  registrationNumber: {
    type: String,
    trim: true,
    default: null,
  },

  licenseNumber: {
    type: String,
    trim: true,
    default: null,
  },

  description: {
    type: String,
    default: null,
  },

  facilities: {
    type: [String],
    default: [],
  },

  departments: {
    type: [String],
    default: []
  },

  operatingHours: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },

  coverPhoto: {
    type: String,
    default: null,
  },

  // ---------------- Contact & Location ----------------
  emergencyPhoneNumber: {
    type: String,
    default: null,
  },

  website: {
    type: String,
    default: null,
  },

  city: {
    type: String,
    default: null,
    index: true,
  },

  state: {
    type: String,
    default: null,
    index: true,
  },

  zip: {
    type: String,
    default: null,
  },

  // ---------------- Capacity ----------------
  bedCount: {
    type: Number,
    default: null,
    min: 0,
  },

  icuBedCount: {
    type: Number,
    default: null,
    min: 0,
  },

  emergencyBedCount: {
    type: Number,
    default: null,
    min: 0,
  },

  // ---------------- Status ----------------
  isOpen: {
    type: Boolean,
    default: false,
  },

  hasEmergency: {
    type: Boolean,
    default: false,
  },

  is24x7: {
    type: Boolean,
    default: false,
  },

  type: {
    type: String,
    default: null,
  },

  // ---------------- Reviews ----------------
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: null,
  },

  totalReviews: {
    type: Number,
    default: 0,
  },

  accreditations: {
    type: [String],
    default: [],
  },

  hospitalImages: {
    type: [String],
    default: [],
  },

  // ---------------- Search Helpers ----------------
  distance: {
    type: Number,
    default: null,
  },
});

// ---------------- Hooks ----------------
hospitalSchema.pre("validate", function () {
  if (!this.role) {
    this.role = "hospital";
  }
});

// ---------------- Instance Methods ----------------
hospitalSchema.methods.getRoleData = function () {
  const baseData = this.getBaseData();

  return {
    ...baseData,
    hospitalName: this.hospitalName,
    registrationNumber: this.registrationNumber,
    licenseNumber: this.licenseNumber,
    description: this.description,
    facilities: this.facilities,
    operatingHours: this.operatingHours,
    coverPhoto: this.coverPhoto,
    emergencyPhoneNumber: this.emergencyPhoneNumber,
    website: this.website,
    city: this.city,
    state: this.state,
    zip: this.zip,
    bedCount: this.bedCount,
    icuBedCount: this.icuBedCount,
    emergencyBedCount: this.emergencyBedCount,
    type: this.type,
    isOpen: this.isOpen,
    hasEmergency: this.hasEmergency,
    is24x7: this.is24x7,
    rating: this.rating,
    totalReviews: this.totalReviews,
    departments: this.departments,
    accreditations: this.accreditations,
    hospitalImages: this.hospitalImages,
  };
};

// ---------------- Helper Methods ----------------
hospitalSchema.methods.hasCompleteProfile = function () {
  return Boolean(
    this.hospitalName &&
    this.registrationNumber &&
    this.address &&
    this.city
  );
};

hospitalSchema.methods.getVerificationStatus = function () {
  return this.isVerified ? "Verified" : "Pending Verification";
};

hospitalSchema.methods.getDisplayName = function () {
  return this.hospitalName || this.name;
};

// ---------------- Indexes (IMPORTANT) ----------------
hospitalSchema.index({ city: 1, state: 1 });
hospitalSchema.index({ hospitalName: "text" });

// ---------------- Model ----------------
const Hospital = mongoose.model("Hospital", hospitalSchema, "hospitals");

module.exports = Hospital;
