const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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
    dob: { 
      type: Date, 
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
