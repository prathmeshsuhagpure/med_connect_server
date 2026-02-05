const User = require('../models/user_model');

/* const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Validate email format if provided
        if (req.body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(req.body.email)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format",
                });
            }

            // Check if email already exists for another user
            const existingUser = await User.findOne({
                email: req.body.email,
                _id: { $ne: userId },
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists",
                });
            }
        }

        // Validate phone number if provided
        if (req.body.phoneNumber) {
            const phoneRegex = /^[+]?[1-9][\d\s\-\(\)]{7,15}$/;
            if (!phoneRegex.test(req.body.phoneNumber)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid phone number format",
                });
            }
        }

        // Update allowed fields only if provided
        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;
        if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;
        if (req.body.gender) user.gender = req.body.gender;
        if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;
        if (req.body.address) user.address = req.body.address;
        if (req.body.bloodGroup) user.bloodGroup = req.body.bloodGroup;
        if (req.body.height) user.height = req.body.height;
        if (req.body.weight) user.weight = req.body.weight;
        if (req.body.emergencyContactName) user.emergencyContactName = req.body.emergencyContactName;
        if (req.body.emergencyContactNumber) user.emergencyContactNumber = req.body.emergencyContactNumber;

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
        });
    }
    catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({
            success: false,
            message: "Server error occurred while updating profile",
        });
    }
} */

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId; // From authMiddleware
        const {
            name,
            email,
            phoneNumber,
            dateOfBirth,
            gender,
            bloodGroup,
            height,
            weight,
            address,
            emergencyName,
            emergencyContact,
            allergies,
            medications,
            conditions,
        } = req.body;

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

        // Update basic fields
        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phone;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (gender) user.gender = gender;
        if (bloodGroup) user.bloodGroup = bloodGroup;
        if (height) user.height = height;
        if (weight) user.weight = weight;
        if (address) user.address = address;

        // Update emergency contact (create object if doesn't exist)
        if (emergencyName || emergencyContact) {
            user.emergencyContact = {
                name: emergencyName || user.emergencyContact?.name,
                phone: emergencyContact || user.emergencyContact?.phone,
            };
        }

        // Update medical info (create object if doesn't exist)
        if (allergies !== undefined || medications !== undefined || conditions !== undefined) {
            user.medicalInfo = {
                allergies: allergies || user.medicalInfo?.allergies || '',
                medications: medications || user.medicalInfo?.medications || '',
                conditions: conditions || user.medicalInfo?.conditions || '',
            };
        }

        // Save updated user
        await user.save();

        // Return updated user data (without password)
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                dateOfBirth: user.dateOfBirth,
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
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        // req.userId is set by authMiddleware
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phoneNumber,
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
                // Add other fields as needed
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
};

const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.userId;

        // Find and delete user
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

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
