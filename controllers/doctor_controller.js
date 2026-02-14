const Doctor = require("../models/user/doctor_model");

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

const getDoctorsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const doctors = await Doctor.find({ hospitalId });

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch hospital doctors",
      error: error.message,
    });
  }
};

const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);

    res.status(201).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create doctor",
      error: error.message,
    });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedDoctor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update doctor",
      error: error.message,
    });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
      error: error.message,
    });
  }
};

module.exports = {getAllDoctors, getDoctorsByHospital, createDoctor, updateDoctor, deleteDoctor};