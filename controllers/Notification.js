const Notification = require('../models/notification');

exports.getNotifications = async (req, res) => {
  try {
    console.log("👉 User from middleware:", req.user); // Debug
    const userId = req.user.id; // ✅ authMiddleware se aana chahiye

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: err.message
    });
  }
};

exports.markAsApproved = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: "read" },   // yahan approval ya read ka scene
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(updatedNotification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
