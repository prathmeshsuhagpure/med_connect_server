const express = require("express");
const router = express.Router();

const doctorController = require("../controllers/doctor_controller");

// Doctors
router.get("/getDoctors", doctorController.getAllDoctors);
router.post("/addDoctors", doctorController.createDoctor);
router.put("/updateDoctor/:id", doctorController.updateDoctor);
router.delete("/deleteDoctor/:id", doctorController.deleteDoctor);

// Hospital specific
router.get(
  "/hospitals/:hospitalId/doctors",
  doctorController.getDoctorsByHospital
);

module.exports = router;
