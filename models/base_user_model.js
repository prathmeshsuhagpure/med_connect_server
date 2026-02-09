const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const createBaseUserSchema = () => {
  const schema = new mongoose.Schema(
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
      role: {
        type: String,
        required: true,
        immutable: true, // Role cannot be changed after creation
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
      isActive: {
        type: Boolean,
        default: true,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
    { 
      timestamps: true,
    }
  );

  // Indexes
  schema.index({ isActive: 1 });

  // Hash password before saving
  schema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
  });

  // Method to compare passwords
  schema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) {
      throw new Error("User does not have a password set");
    }
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Get base data (common fields)
  schema.methods.getBaseData = function () {
    return {
      id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
      phoneNumber: this.phoneNumber,
      address: this.address,
      profilePicture: this.profilePicture,
      isVerified: this.isVerified,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  };

  return schema;
};

module.exports = createBaseUserSchema;