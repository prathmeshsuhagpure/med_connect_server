const cron = require("node-cron");
const Appointment = require("../models/appointment_model");
const Patient = require("../models/user/patient_model");
const { sendNotification } = require("../services/notification_service");

cron.schedule("*/5 * * * *", async () => {
    try {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        const appointments = await Appointment.find({
            appointmentDate: {
                $gte: now,
                $lte: oneHourLater,
            },
            reminderSent: false,
            status: "confirmed",
        });

        for (const appointment of appointments) {
            const patient = await Patient.findById(appointment.patientId);

            if (!patient || !patient.fcmToken) continue;

            await sendNotification(
                patient.fcmToken,
                "Appointment Reminder",
                `You have an appointment at ${appointment.appointmentTime.toLocaleTimeString()}. Please arrive 5 to 10 minutes early. Thank you!`,
                "appointment_reminder"
            );

            // Mark reminder as sent
            appointment.reminderSent = true;
            await appointment.save();
        }

    } catch (error) {
        console.error("Reminder job error:", error);
    }
});