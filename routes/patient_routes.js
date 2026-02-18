const express = require('express');
const router = express.Router();

const {
  getAllPatients,
  getPatientsByHospital,
  getPatientsByDoctor,
  getRecentPatientsByHospital,
} = require('../controllers/patient_controller');

const { protect } = require('../middlewares/auth_middleware');

router.get('/getAllPatients', protect, getAllPatients );

router.get('/getPatientByHospital/:hospitalId', protect, getPatientsByHospital );

router.get("/getPatientByDoctor/:hospitalId", protect, getPatientsByDoctor);

router.get("/getPatientByHospital/:hospitalId/recent", protect, getRecentPatientsByHospital);

module.exports = router;