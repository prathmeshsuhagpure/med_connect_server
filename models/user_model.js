const mongoose = require("mongoose");
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
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["patient", "hospital"],
      default: "patient",
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    hospitalName: {
      type: String,
      default: null,
    },
    registrationNumber: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "",
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
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
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    throw new Error("User does not have a password set");
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
