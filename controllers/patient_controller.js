const Patient = require("../models/user/patient_model");
const Appointment = require("../models/appointment_model");

const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select("-__v");

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });

  } catch (error) {
    console.error("Error fetching all patients:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPatientsByHospital = async (req, res) => {
  try {
    const hospitalId = req.params.hospitalId;

    const appointments = await Appointment.find({ hospitalId })
      .populate({
        path: "patientId",
        select: "-__v",
      });

    const uniquePatients = [
      ...new Map(
        appointments.map(app => [
          app.patientId._id.toString(),
          app.patientId,
        ])
      ).values(),
    ];

    res.status(200).json({
      success: true,
      count: uniquePatients.length,
      data: uniquePatients,
    });

  } catch (error) {
    console.error("Error fetching hospital patients:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPatientsByDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const appointments = await Appointment.find({ doctorId })
      .populate({
        path: "patientId",
        select: "-__v",
      });

    const uniquePatients = [
      ...new Map(
        appointments.map(app => [
          app.patientId._id.toString(),
          app.patientId,
        ])
      ).values(),
    ];

    res.status(200).json({
      success: true,
      count: uniquePatients.length,
      data: uniquePatients,
    });

  } catch (error) {
    console.error("Error fetching doctor patients:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRecentPatientsByHospital = async (req, res) => {
  try {
    const hospitalId = req.params.hospitalId;
    const appointments = await Appointment.find({ hospitalId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({
        path: "patientId", select: "-__v",
      });
    const uniquePatients = [
      ...new Map(
        appointments.map(app => [
          app.patientId._id.toString(),
          app.patientId,
        ])
      ).values(),
    ];
    res.status(200).json({
      success: true,
      count: uniquePatients.length,
      data: uniquePatients,
    });
  } catch (error) {
    console.error("Error fetching recent hospital patients:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientsByHospital,
  getPatientsByDoctor,
  getRecentPatientsByHospital,
};
