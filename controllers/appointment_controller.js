const Appointment = require("../models/appointment_model");

const createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      patientId: req.user.id,
    });
    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({
      appointmentDate: 1,
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching appointment",
      error: error.message,
    });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
      error: error.message,
    });
  }
};

const getAppointmentsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required",
      });
    }

    const appointments = await Appointment.find({ hospitalId })
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .populate('patientId', 'name email phoneNumber profilePicture')
      .populate('doctorId', 'name specialization profilePicture');

    // ✅ Map to include patientName in response
    const appointmentsWithPatientName = appointments.map(apt => {
      const aptObj = apt.toObject();
      if (apt.patientId) {
        aptObj.patientName = apt.patientId.name;
      }
      return aptObj;
    });

    res.status(200).json({
      success: true,
      data: appointmentsWithPatientName,
    });
  } catch (error) {
    console.error("Get appointments by hospital error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hospital appointments",
      error: error.message,
    });
  }
};

const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    const appointments = await Appointment.find({ doctorId })
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .populate('patientId', 'name email phoneNumber profilePicture')
      .populate('hospitalId', 'hospitalName address phoneNumber');

    // ✅ Map to include patientName in response
    const appointmentsWithPatientName = appointments.map(apt => {
      const aptObj = apt.toObject();
      if (apt.patientId) {
        aptObj.patientName = apt.patientId.name;
      }
      return aptObj;
    });

    res.status(200).json({
      success: true,
      data: appointmentsWithPatientName,
    });
  } catch (error) {
    console.error("Get appointments by doctor error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor appointments",
      error: error.message,
    });
  }
};

// ✅ Updated cancelAppointment to handle cancelledBy
const cancelAppointment = async (req, res) => {
  try {
    const { reason, cancelledBy } = req.body;

    if (!cancelledBy || !['patient', 'hospital'].includes(cancelledBy)) {
      return res.status(400).json({
        success: false,
        message: "cancelledBy must be 'patient' or 'hospital'",
      });
    }

    const status =
      cancelledBy === "patient"
        ? "cancelledByPatient"
        : "cancelledByHospital";

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status,
        cancellationReason: reason || null,
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        appointmentDate,
        appointmentTime,
        status: "confirmed",
        cancellationReason: null,
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reschedule appointment",
      error: error.message,
    });
  }
};

const getAppointmentsByPatient = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.user.id,
    }).sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  cancelAppointment,
  deleteAppointment,
  rescheduleAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  getAppointmentsByHospital,
};
