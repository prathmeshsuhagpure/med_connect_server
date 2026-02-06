/* const User = require("../models/user_model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      phoneNumber,
      hospitalName,
      registrationNumber,
      address,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      confirmPassword,
      role,
      phoneNumber,
      hospitalName,
      registrationNumber,
      address,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        hospitalName: user.hospitalName,
        registrationNumber: user.registrationNumber,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email, role }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check role if specified - FIXED: Changed from User.role to req.body.role
    const requestedRole = req.body.role;
    if (requestedRole && user.role !== requestedRole) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as a ${user.role}, not a ${requestedRole}`,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        hospitalName: user.hospitalName,
        registrationNumber: user.registrationNumber,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided or invalid format',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.',
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
      }
      throw jwtError;
    }

    // Check if user still exists in database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
    }

    // Check if user account is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }

    // Token is valid - return success with user data
    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        dob: user.dob,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        height: user.height,
        weight: user.weight,
        address: user.address,
        emergencyName: user.emergencyContact?.name,
        emergencyContact: user.emergencyContact?.phone,
        allergies: user.medicalInfo?.allergies,
        medications: user.medicalInfo?.medications,
        conditions: user.medicalInfo?.conditions,
        hospitalName: user.hospitalName,
        registrationNumber: user.registrationNumber,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during token verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const logout = async (req, res) => {
  try {
    // If you're implementing token blacklisting, add logic here
    // For now, we'll just return success as logout is handled client-side

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during logout',
    });
  }
};

module.exports = { login, signup, verifyToken, logout, }; */

const User = require("../models/user_model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sanitizeUserData = (data) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === '') {
      sanitized[key] = null;
    } else if (value !== undefined) {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      phoneNumber,
      address,
      hospitalName,
      registrationNumber,
      specialization,
      qualification,
      licenseNumber,
      gender,
      bloodGroup,
    } = req.body;

    if (!name || !email || !password || !role || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = sanitizeUserData({
      name,
      email,
      password : hashedPassword,
      role,
      phoneNumber,
      address,
      gender,
      bloodGroup,
    });

    if (role === 'hospital') {
      if (!hospitalName || !registrationNumber) {
        return res.status(400).json({
          success: false,
          message: 'Hospital name and registration number are required for hospitals',
        });
      }
      userData.hospitalName = hospitalName;
      userData.registrationNumber = registrationNumber;
      if (licenseNumber) userData.licenseNumber = licenseNumber;
    }

    if (role === 'doctor') {
      if (!specialization || !qualification) {
        return res.status(400).json({
          success: false,
          message: 'Specialization and qualification are required for doctors',
        });
      }
      userData.specialization = specialization;
      userData.qualification = qualification;
      if (licenseNumber) userData.licenseNumber = licenseNumber;
    }

    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getRoleData(),
    });

  } catch (error) {
    console.error('Signup error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Error registering user',
    });
  }
}

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email, role }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email or Password"
      });
    }

    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `This account is not registered as a ${role}`,
      });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getRoleData(),
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error logging in',
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided or invalid format',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.',
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
      }
      throw jwtError;
    }

    // Find user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
    }

    // Check if account is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }

    // Return user data
    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: user.getRoleData(),
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during token verification',
    });
  }
};

const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during logout',
    });
  }
};

module.exports = { login, signup, verifyToken, logout, };