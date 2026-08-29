const express = require("express");
const auth = require("../auth/auth");
// ****const { auth, authorize } = require("../auth/auth");*****
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
//user can see his own message , admin can see all messages
// ****router.get("/", auth,authorize("admin"),getAllSupportMessages);****
router.get("/:id",auth,getSupportMessageById);
//***router.put("/:id/status", auth,authorize("admin") , updateSupportMessageStatus);***
router.put("/:id/status", auth, updateSupportMessageStatus);

module.exports = router;