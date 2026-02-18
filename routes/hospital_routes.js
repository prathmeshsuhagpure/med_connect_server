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

const { protect } = require('../middlewares/auth_middleware');


router.get('/', getHospitals);
router.get('/:id', getHospitalById);

// Hospital-specific doctor routes
router.get('/:hospitalId/doctors', getDoctorsByHospital);

router.post("/addHospital", protect, createHospital);
router.put("/updateHospital/:id", protect, updateHospital);
router.delete("/deleteHospital/:id", protect, deleteHospital);
router.patch("/:id/toggle-status", protect, toggleHospitalStatus);


module.exports = router;