// routes/hospitalRoutes.js
const express = require('express');
const router = express.Router();
const {
    getHospitals,
    createHospital,
    updateHospital,
    deleteHospital,
    getHospitalById,
    toggleHospitalStatus,
} = require('../controllers/hospital_controller');

const { getDoctorsByHospital } = require('../controllers/doctor_controller');

// Import middleware
const { protect } = require('../middlewares/auth_middleware');


router.get('/', getHospitals);
router.get('/:id', getHospitalById);

// Hospital-specific doctor routes
router.get('/:hospitalId/doctors', getDoctorsByHospital);

// CREATE
router.post("/addHospital", protect, createHospital);

// UPDATE
router.put("/updateHospital/:id", protect, updateHospital);

// DELETE
router.delete("/deleteHospital/:id", protect, deleteHospital);

// TOGGLE STATUS
router.patch("/:id/toggle-status", protect, toggleHospitalStatus);


module.exports = router;