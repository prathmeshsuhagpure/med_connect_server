const Appointment = require("../models/appointment_model");
const Patient = require("../models/user/patient_model");
const Doctor = require("../models/user/doctor_model");
const Hospital = require("../models/user/hospital_model");
const { sendNotification } = require("../services/notification_service");


const createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      patientId: req.user.id,
    });

    await appointment.save();
    console.log("✅ Appointment saved:", appointment._id);

    const [patient, doctor, hospital] = await Promise.all([
      Patient.findById(req.user.id),
      Doctor.findById(appointment.doctorId),
      Hospital.findById(appointment.hospitalId),
    ]);

    console.log("📌 Patient:", patient?._id, "Token:", patient?.fcmToken);
    console.log("📌 Doctor:", doctor?._id, "Token:", doctor?.fcmToken);
    console.log("📌 Hospital:", hospital?._id, "Token:", hospital?.fcmToken);

    // Build notification promises safely
    const notifications = [];

    if (patient?.fcmToken) {
      notifications.push({
        role: "Patient",
        promise: sendNotification(
          patient.fcmToken,
          "Appointment Request Sent",
          `Your appointment request for ${appointment.appointmentDate} at ${appointment.appointmentTime} was sent.`
        ),
      });
    }

    if (doctor?.fcmToken) {
      notifications.push({
        role: "Doctor",
        promise: sendNotification(
          doctor.fcmToken,
          "New Appointment Request",
          `New patient booked for ${appointment.appointmentDate} at ${appointment.appointmentTime}.`
        ),
      });
    }

    if (hospital?.fcmToken) {
      notifications.push({
        role: "Hospital",
        promise: sendNotification(
          hospital.fcmToken,
          "New Appointment Scheduled",
          `Doctor has a new booking on ${appointment.appointmentDate}.`
        ),
      });
    }

    const notificationResults = await Promise.allSettled(
      notifications.map(n => n.promise)
    );

    notificationResults.forEach((result, index) => {
      const role = notifications[index].role;

      if (result.status === "fulfilled") {
        console.log(`✅ ${role} notification sent successfully`);
      } else {
        console.error(`❌ ${role} notification failed:`, result.reason);
      }
    });

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });

  } catch (error) {
    console.error("❌ Create appointment error:", error);
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

    const [patient, doctor] = await Promise.all([
      Patient.findById(appointment.patientId),
      Doctor.findById(appointment.doctorId),
    ]);

    await Promise.all([
      sendNotification(
        patient?.fcmToken,
        "Appointment Cancelled",
        `Your appointment on ${appointment.appointmentDate} was cancelled.`
      ),
      sendNotification(
        doctor?.fcmToken,
        "Appointment Cancelled",
        `An appointment on ${appointment.appointmentDate} was cancelled.`
      ),
    ]);

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

    const patient = await Patient.findById(appointment.patientId);

    await sendNotification(
      patient?.fcmToken,
      "Appointment Rescheduled",
      `Your appointment has been moved to ${appointment.appointmentDate} at ${appointment.appointmentTime}.`
    );


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

const confirmAppointmentByHospital = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId, {
      status: "confirmed",
      cancellationReason: null,
    },
      { new: true })
      .populate("patientId", "name email phoneNumber profilePicture")
      .populate("doctorId", "name specialization profilePicture")
      .populate("hospitalId", "hospitalName address phoneNumber");
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    const patient = await Patient.findById(appointment.patientId);

    await sendNotification(
      patient?.fcmToken,
      "Appointment Confirmed",
      `Your appointment for ${appointment.appointmentDate} at ${appointment.appointmentTime} has been confirmed by the hospital.`
    );

    res.status(200).json({
      success: true,
      message: "Appointment confirmed successfully by hospital",
      data: appointment,
    });
  } catch (error) {
    console.error("Confirm appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm appointment",
      error: error.message,
    });
  }
};

const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Not found" });
    }

    appointment.status = "completed";
    appointment.completedAt = new Date();

    await appointment.save();

    const patient = await Patient.findById(appointment.patientId);

    await sendNotification(
      patient?.fcmToken,
      "Appointment Completed",
      "Your appointment has been marked as completed."
    );

    res.json({ success: true, data: appointment });

  } catch (error) {
    res.status(500).json({ message: error.message });
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
  confirmAppointmentByHospital,
  completeAppointment,
};
