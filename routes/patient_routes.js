const express = require('express');
const router = express.Router();

const {
  getAllPatients,
  getPatientsByHospital,
  getPatientsByDoctor,
} = require('../controllers/patient_controller');

const { protect } = require('../middlewares/auth_middleware');

router.get('/getAllPatients', protect, getAllPatients );

router.get('/getPatientByHospital/:id', protect, getPatientsByHospital );

router.get("/getPatientByDoctor/:id", protect, getPatientsByDoctor);

module.exports = router;