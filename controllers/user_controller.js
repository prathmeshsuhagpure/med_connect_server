/* const User = require('../models/user_model');

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updates = req.body;
        const { email } = req.body;

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            user.email = email;
        }

        const commonFields = ['name', 'address'];
        commonFields.forEach(field => {
            if (updates[field] !== undefined) {
                user[field] = updates[field] || null;
            }
        });

        if (updates.phone !== undefined) {
            user.phoneNumber = updates.phone || null;
        }

        switch (user.role) {
            case 'patient':
                updatePatientFields(user, updates);
                break;

            case 'hospital':
                updateHospitalFields(user, updates);
                break;

            case 'doctor':
                updateDoctorFields(user, updates);
                break;
        }

        // Save updated user
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: user.getRoleData(),
        });

    } catch (error) {
        console.error('Update profile error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            user: user.getRoleData()
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
};

const updatePatientFields = (user, updates) => {
    // Personal information
    if (updates.dob !== undefined) {
        user.dateOfBirth = updates.dob || null;
    }

    if (updates.gender !== undefined) {
        user.gender = updates.gender && updates.gender.trim() !== '' ? updates.gender : null;
    }

    if (updates.bloodGroup !== undefined) {
        user.bloodGroup = updates.bloodGroup && updates.bloodGroup.trim() !== '' ? updates.bloodGroup : null;
    }

    if (updates.height !== undefined) {
        user.height = updates.height || null;
    }

    if (updates.weight !== undefined) {
        user.weight = updates.weight || null;
    }

    // Emergency contact
    if (updates.emergencyName !== undefined || updates.emergencyContact !== undefined) {
        if (!user.emergencyContact) {
            user.emergencyContact = {};
        }
        if (updates.emergencyName !== undefined) {
            user.emergencyContact.name = updates.emergencyName || null;
        }
        if (updates.emergencyContact !== undefined) {
            user.emergencyContact.phone = updates.emergencyContact || null;
        }
    }

    // Medical information
    if (updates.allergies !== undefined || updates.medications !== undefined || updates.conditions !== undefined) {
        if (!user.medicalInfo) {
            user.medicalInfo = {};
        }
        if (updates.allergies !== undefined) {
            user.medicalInfo.allergies = updates.allergies || null;
        }
        if (updates.medications !== undefined) {
            user.medicalInfo.medications = updates.medications || null;
        }
        if (updates.conditions !== undefined) {
            user.medicalInfo.conditions = updates.conditions || null;
        }
    }
};

const updateHospitalFields = (user, updates) => {
    const hospitalFields = [
        'hospitalName',
        'registrationNumber',
        'licenseNumber',
        'specialties',
        'facilities',
        'operatingHours'
    ];

    hospitalFields.forEach(field => {
        if (updates[field] !== undefined) {
            user[field] = updates[field] || null;
        }
    });
};

const updateDoctorFields = (user, updates) => {
    const doctorFields = [
        'specialization',
        'qualification',
        'licenseNumber',
        'experience',
        'hospitalAffiliation',
        'consultationFee',
        'availableHours'
    ];

    doctorFields.forEach(field => {
        if (updates[field] !== undefined) {
            user[field] = updates[field] || null;
        }
    });
};

const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.userId;
        const { password } = req.body;

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password before deletion
        if (password) {
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid password'
                });
            }
        }

        // Soft delete (set isActive to false)
        user.isActive = false;
        await user.save();

        // Or hard delete
        // await User.findByIdAndDelete(userId);

        return res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting account'
        });
    }
};

module.exports = { updateUserProfile, getUserProfile, deleteUserAccount, };
 */

const { Patient, Doctor, Hospital, UserFactory } = require('../models/user_factory');

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const updates = req.body;
    const { email } = req.body;

    const user = await UserFactory.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
     
      const emailExists = await UserFactory.findByEmail(email);
      
      // Make sure it's not the same user
      if (emailExists && emailExists._id.toString() !== userId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
    }

    // Update common fields
    const commonFields = ['name', 'address'];
    commonFields.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field] || null;
      }
    });

    if (updates.phone !== undefined) {
      user.phoneNumber = updates.phone || null;
    }

    // Update role-specific fields
    switch (user.role) {
      case 'patient':
        updatePatientFields(user, updates);
        break;

      case 'hospital':
        updateHospitalFields(user, updates);
        break;

      case 'doctor':
        updateDoctorFields(user, updates);
        break;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: UserFactory.getUserData(user),
    });

  } catch (error) {
    console.error('Update profile error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const user = await UserFactory.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: UserFactory.getUserData(user)
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

const updatePatientFields = (user, updates) => {
  // Personal information
  if (updates.dob !== undefined) {
    user.dateOfBirth = updates.dob || null;
  }

  if (updates.gender !== undefined) {
    user.gender = updates.gender && updates.gender.trim() !== '' ? updates.gender : null;
  }

  if (updates.bloodGroup !== undefined) {
    user.bloodGroup = updates.bloodGroup && updates.bloodGroup.trim() !== '' ? updates.bloodGroup : null;
  }

  if (updates.height !== undefined) {
    user.height = updates.height || null;
  }

  if (updates.weight !== undefined) {
    user.weight = updates.weight || null;
  }

  // Emergency contact
  if (updates.emergencyName !== undefined || updates.emergencyContact !== undefined) {
    if (!user.emergencyContact) {
      user.emergencyContact = {};
    }
    if (updates.emergencyName !== undefined) {
      user.emergencyContact.name = updates.emergencyName || null;
    }
    if (updates.emergencyContact !== undefined) {
      user.emergencyContact.phone = updates.emergencyContact || null;
    }
  }

  // Medical information
  if (updates.allergies !== undefined || updates.medications !== undefined || updates.conditions !== undefined) {
    if (!user.medicalInfo) {
      user.medicalInfo = {};
    }
    if (updates.allergies !== undefined) {
      user.medicalInfo.allergies = updates.allergies || null;
    }
    if (updates.medications !== undefined) {
      user.medicalInfo.medications = updates.medications || null;
    }
    if (updates.conditions !== undefined) {
      user.medicalInfo.conditions = updates.conditions || null;
    }
  }
};

const updateHospitalFields = (user, updates) => {
  const hospitalFields = [
    'hospitalName',
    'registrationNumber',
    'licenseNumber',
    'specialties',
    'facilities',
    'operatingHours',
    'description',
    'departments',
    'type',
    'hasEmergency',
    'is24x7',
    'isOpen',
    'city',
    'state',
    'zip',
    'bedCount',
    'icuBedCount',
    'emergencyBedCount',
    'logo',
    'coverPhoto',
    'emergencyPhoneNumber',
    'website',
    'isVerified'
  ];

  hospitalFields.forEach(field => {
    if (updates[field] !== undefined) {
      user[field] = updates[field] || null;
    }
  });
};

const updateDoctorFields = (user, updates) => {
  const doctorFields = [
    'specialization',
    'qualification',
    'licenseNumber',
    'experience',
    'hospitalAffiliation',
    'consultationFee',
    'availableHours'
  ];

  doctorFields.forEach(field => {
    if (updates[field] !== undefined) {
      user[field] = updates[field] || null;
    }
  });
};

const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    const { password } = req.body;

    const user = await UserFactory.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password before deletion
    if (password) {
      const isPasswordValid = await user.matchPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }
    }

    // Soft delete (set isActive to false)
    user.isActive = false;
    await user.save(); // Saves to correct collection

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
};

const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const filters = req.query; // e.g., ?isVerified=true&isActive=true

    // Get users from specific collection
    const users = await UserFactory.findByRole(role, filters);

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(user => UserFactory.getUserData(user))
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const { specialization, isVerified } = req.query;

    const query = { isActive: true };
    if (specialization) query.specialization = specialization;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    // Direct query to doctors collection (most efficient)
    const doctors = await Doctor.find(query).sort({ rating: -1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors: doctors.map(doc => UserFactory.getUserData(doc))
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching doctors'
    });
  }
};

const getAllHospitals = async (req, res) => {
  try {
    const { minRating } = req.query;

    const query = { isActive: true };
    if (minRating) query.rating = { $gte: parseFloat(minRating) };

    // Direct query to hospitals collection (most efficient)
    const hospitals = await Hospital.find(query).sort({ rating: -1 });

    return res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals: hospitals.map(h => UserFactory.getUserData(h))
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching hospitals'
    });
  }
};

module.exports = { 
  updateUserProfile, 
  getUserProfile, 
  deleteUserAccount,
  getUsersByRole,
  getAllDoctors,
  getAllHospitals,
};