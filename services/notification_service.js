const admin = require("../config/firebase");

const sendNotification = async (token, title, body, type = "appointment") => {
  if (!token) return;

  try {
    await admin.messaging().send({
      token,
      notification: {
        title,
        body,
      },
      data: {
        title,
        body,
        type,
      },
      android: {
        priority: "high",
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    });
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

const sendTopicNotification = async (
  topic,
  title,
  body,
  type = "general",
  data = {}
) => {
  try {
    await admin.messaging().send({
      topic,
      notification: {
        title,
        body,
      },
      data: {
        title,
        body,
        type,
        ...Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
      },
      android: {
        priority: "high",
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    });
  } catch (error) {
    console.error("Topic notification error:", error.message);
  }
};

module.exports = { sendNotification, sendTopicNotification };