const express = require("express");
const router = express.Router();
const controller = require("../controllers/appointment_controller");

// CRUD
router.post("/createAppointment", controller.createAppointment);
router.get("/getAppointments", controller.getAllAppointments);
router.get("/getAppointment/:id", controller.getAppointmentById);
router.put("/updateAppointment/:id", controller.updateAppointment);
router.delete("/deleteAppointment/:id", controller.deleteAppointment);

// Special Actions
router.put("/:id/cancel", controller.cancelAppointment);
router.put("/:id/reschedule", controller.rescheduleAppointment);

module.exports = router;
