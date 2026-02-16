const Patient = require("../models/user/patient_model");

const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("hospital", "name email")
      .populate("assignedDoctors", "name specialization")
      .select("-__v");

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });

  } catch (error) {
    console.error("Error fetching all patients:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getPatientsByHospital = async (req, res) => {
  try {
    const hospitalId = req.params.hospitalId;

    const patients = await Patient.find({ hospital: hospitalId })
      .populate("hospital", "name email")
      .populate("assignedDoctors", "name specialization")
      .select("-__v");

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });

  } catch (error) {
    console.error("Error fetching hospital patients:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getPatientsByDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const patients = await Patient.find({
      assignedDoctors: doctorId,
    })
      .populate("hospital", "name email")
      .populate("assignedDoctors", "name specialization")
      .select("-__v");

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });

  } catch (error) {
    console.error("Error fetching doctor patients:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientsByHospital,
  getPatientsByDoctor,
};
