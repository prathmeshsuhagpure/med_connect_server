/* const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
    },
    role: {
      type: String,
      enum: ["patient", "hospital", "doctor"],
      default: "patient",
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: null,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    profilePicturePublicId: {
      type: String,
      default: null,
    },

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

    specialization: {
      type: String,
      default: null,
    },
    qualification: {
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

    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});



userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    throw new Error("User does not have a password set");
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get role-specific data
userSchema.methods.getRoleData = function () {
  const baseData = {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phoneNumber: this.phoneNumber,
    address: this.address,
    profilePicture: this.profilePicture,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  switch (this.role) {
    case 'patient':
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

    case 'hospital':
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

    case 'doctor':
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

    default:
      return baseData;
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
 */