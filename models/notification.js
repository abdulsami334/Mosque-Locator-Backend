// models/notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contributor', required: true },
  mosqueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mosque', required: false }, // ✅ add this
  message: { type: String, required: true },
  status: { type: String, enum: ["unread", "read", "approved", "rejected"], default: "unread" }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
