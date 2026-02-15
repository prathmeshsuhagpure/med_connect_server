const express = require("express");
const router = express.Router();
const controller = require("../controllers/appointment_controller");
const {protect} = require("../middlewares/auth_middleware");

// Create Appointment
router.post("/createAppointment", protect, controller.createAppointment);

// Get Appointment
router.get("/getAllAppointments", controller.getAllAppointments);
router.get("/getAppointment/:id", controller.getAppointmentById);

// Delete Appointment
router.delete("/deleteAppointment/:id", controller.deleteAppointment);

// Get Patient Appointments
router.get("/getAppointment/patient/:patientId", protect, controller.getAppointmentsByPatient);

// Get Hospital Appointments
router.get('getAppointment/hospital/:hospitalId', protect, controller.getAppointmentsByHospital);

// Get Doctor Appointment
router.get('getAppointment/doctor/:doctorId', protect, controller.getAppointmentsByDoctor);

// Special Actions
router.put("/:id/cancel", controller.cancelAppointment);
router.put("/:id/reschedule", controller.rescheduleAppointment);
//router.put('/:id', protect, controller.updateAppointment);

module.exports = router;
