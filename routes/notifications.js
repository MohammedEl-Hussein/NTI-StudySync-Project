const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications');

const isAuth = require('../auth/auth'); 

router.get('/', isAuth, notificationController.getUserNotifications);
router.put('/:id/read', isAuth, notificationController.markAsRead);
router.put('/read-all', isAuth, notificationController.markAllAsRead);

module.exports = router;