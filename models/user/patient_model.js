const mongoose = require("mongoose");
const createBaseUserSchema = require("./base_user_model");

const patientSchema = createBaseUserSchema();

// Add patient-specific fields
patientSchema.add({
  dateOfBirth: {
    type: String,
    default: null,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    default: null,
  },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    default: null,
  },
  height: {
    type: String,
    default: '',
  },
  weight: {
    type: String,
    default: '',
  },
  emergencyContact: {
    name: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
  },
  medicalInfo: {
    allergies: {
      type: String,
      default: '',
    },
    medications: {
      type: String,
      default: '',
    },
    conditions: {
      type: String,
      default: '',
    },
  },
});

// Set default role for patients
patientSchema.pre('validate', async function () {
  if (!this.role) {
    this.role = 'patient';
  }
});

// Method to get patient-specific data
patientSchema.methods.getRoleData = function () {
  const baseData = this.getBaseData();
  return {
    ...baseData,
    dob: this.dateOfBirth,
    gender: this.gender,
    bloodGroup: this.bloodGroup,
    height: this.height,
    weight: this.weight,
    emergencyName: this.emergencyContact?.name,
    emergencyContact: this.emergencyContact?.phone,
    allergies: this.medicalInfo?.allergies,
    medications: this.medicalInfo?.medications,
    conditions: this.medicalInfo?.conditions,
  };
};

// Virtual to calculate age
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  try {
    const dob = new Date(this.dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  } catch (e) {
    return null;
  }
});

// Helper methods
patientSchema.methods.hasEmergencyContact = function() {
  return !!(this.emergencyContact?.name && this.emergencyContact?.phone);
};

patientSchema.methods.hasCompleteProfile = function() {
  return !!(this.dateOfBirth && this.gender && this.bloodGroup);
};

// Create model with collection name 'patients'
const Patient = mongoose.model('Patient', patientSchema, 'patients');

module.exports = Patient;