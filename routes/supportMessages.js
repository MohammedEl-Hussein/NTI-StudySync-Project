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


router.post("/",auth, createSupportMessage);
router.get("/my", auth, getMySupportMessages);
router.get("/",auth,getAllSupportMessages);
router.get("/:id",auth,getSupportMessageById);
router.put("/:id/status", auth, updateSupportMessageStatus);

module.exports = router;