const { Patient, Doctor, Hospital, UserFactory } = require("../models/user/user_factory");
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

    // Validation
    if (!name || !email || !password || !role || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    const existingUser = await UserFactory.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists" 
      });
    }

    // Prepare base user data
    const userData = sanitizeUserData({
      name,
      email,
      password,
      role,
      phoneNumber,
      address,
      gender,
      bloodGroup,
    });

    // Add role-specific fields
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

    const user = UserFactory.create(userData);
    await user.save();

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: UserFactory.getUserData(user), // Uses getRoleData() method
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

    let user;
    if (role) {
      // More efficient - searches only one collection
      user = await UserFactory.findByEmail(email, role);
    } else {
      // Searches all collections
      user = await UserFactory.findByEmail(email);
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email or Password"
      });
    }

    // Verify role matches
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `This account is not registered as a ${role}`,
      });
    }

    // Check password
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
      user: UserFactory.getUserData(user),
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

    let user;
    if (decoded.role) {
      // More efficient - searches only specific collection
      user = await UserFactory.findById(decoded.id, decoded.role);
    } else {
      // Searches all collections
      user = await UserFactory.findById(decoded.id);
    }

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
      user: UserFactory.getUserData(user),
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

const saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    console.log(
      "Saving FCM token for:",
      req.userId,
      "Role:",
      req.userRole
    );

    // req.user already contains correct model instance
    req.user.fcmToken = fcmToken;

    await req.user.save();

    console.log("✅ FCM token saved successfully");

    return res.status(200).json({
      success: true,
      message: "FCM token saved successfully",
    });

  } catch (error) {
    console.error("❌ Error saving FCM token:", error);

    return res.status(500).json({
      success: false,
      message: "Server error occurred while saving FCM token",
    });
  }
};


module.exports = { login, signup, verifyToken, logout, saveFcmToken };