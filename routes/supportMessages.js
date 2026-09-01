const express = require("express");
const auth = require("../auth/auth");
const router = express.Router();

const {
  createSupportMessage,
  getMySupportMessages,
  getAllSupportMessages,
  getSupportMessageById,
  updateSupportMessageStatus,
} = require("../controllers/supportMessages");

const notificationController = require('../controllers/notifications');

router.post("/",auth, createSupportMessage);
router.get("/my", auth, getMySupportMessages);
router.get("/",auth,getAllSupportMessages);
router.get("/:id",auth,getSupportMessageById);
router.put("/:id/status", auth, updateSupportMessageStatus);

router.get('/', auth, notificationController.getUserNotifications);
router.put('/:id/read', auth, notificationController.markAsRead);
router.put('/read-all', auth, notificationController.markAllAsRead);

module.exports = router;