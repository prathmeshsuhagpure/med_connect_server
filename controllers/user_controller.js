const User = require('../models/user_model');

const updateUserProfile = async (req, res) => {
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
}



module.exports = { updateUserProfile };
