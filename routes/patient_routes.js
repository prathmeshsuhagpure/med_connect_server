const express = require('express');
const router = express.Router();

const {
  getPatients,
  getPatientById,
} = require('../controllers/patient_controller');

const { protect } = require('../middlewares/auth_middleware');

router.get('/getAllPatients', protect, getPatients );

router.get('/getPatientById/:id', protect, getPatientById );

module.exports = router;