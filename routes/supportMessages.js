const express = require("express");

const router = express.Router();

const {
  createSupportMessage,
  getMySupportMessages,
  getAllSupportMessages,
  getSupportMessageById,
  updateSupportMessageStatus,
} = require("../controllers/supportMessages");

router.post("/", createSupportMessage);
router.get("/my", getMySupportMessages);
router.get("/", getAllSupportMessages);
router.get("/:id", getSupportMessageById);
router.put("/:id/status", updateSupportMessageStatus);

module.exports = router;