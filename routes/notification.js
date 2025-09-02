// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const controller = require('../controllers/Notification');

// ✅ Get all notifications of logged-in user
router.get('/', authMiddleware, controller.getNotifications);

module.exports = router;
