const admin = require("../config/firebase");

const sendNotification = async (token, title, body, type = "appointment") => {
  if (!token) return;

  try {
    await admin.messaging().send({
      token,
      data: {
        title,
        body,
        type,
      },
      android: {
        priority: "high",
      },
    });
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

module.exports = { sendNotification };
