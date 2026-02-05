const express = require("express");
const router = express.Router();

const {protect} = require("../middlewares/auth_middleware");
const { updateUserProfile } = require("../controllers/user_controller");


// Upadte User Profile
router.put('/update-profile', protect, updateUserProfile);