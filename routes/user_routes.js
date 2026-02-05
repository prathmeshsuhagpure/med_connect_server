const express = require("express");
const router = express.Router();

const {protect} = require("../middlewares/auth_middleware");
const { updateUserProfile, getUserProfile, deleteUserAccount } = require("../controllers/user_controller");


// Upadte User Profile
router.put('/update-profile', protect, updateUserProfile);

// Get User Profile
router.get('/profile', protect, getUserProfile);

// Delete user account
router.delete('/profile', protect, deleteUserAccount);

module.exports = router;