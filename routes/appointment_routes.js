const express = require("express");
const router = express.Router();
const controller = require("../controllers/appointment_controller");
const {protect} = require("../middlewares/auth_middleware");

// CRUD
router.post("/createAppointment", protect, controller.createAppointment);
router.get("/getAppointments", controller.getAllAppointments);
router.get("/getAppointment/:id", controller.getAppointmentById);
router.delete("/deleteAppointment/:id", controller.deleteAppointment);

// Get Patient Appointments
router.get("/getAppointment/patient/:patientId", protect, controller.getPatientAppointments);


// Special Actions
router.put("/:id/cancel", controller.cancelAppointment);
router.put("/:id/reschedule", controller.rescheduleAppointment);

module.exports = router;
