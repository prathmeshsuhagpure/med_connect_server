const express = require("express");
const router = express.Router();

const { login, signup, verifyToken, logout } = require("../controllers/auth_controller");
const {protect} =require("../middlewares/auth_middleware");

// Auth Routes
router.post("/signup", signup);
router.post("/login", login);
router.post('/verify-token', protect, verifyToken);
router.post('/logout', protect, logout);

module.exports = router;
