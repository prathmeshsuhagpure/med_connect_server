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
router.post("/", protect, createHospital);

// UPDATE
router.put("/:id", protect, updateHospital);

// DELETE
router.delete("/:id", protect, deleteHospital);

// TOGGLE STATUS
router.patch("/:id/toggle-status", protect, toggleHospitalStatus);


module.exports = router;