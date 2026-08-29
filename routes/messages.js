const express = require("express");
const router = express.Router();
const auth = require("../auth/auth");
// const { auth } = require("../auth/auth");
const {
  createMessage,
  getMessagesByChat,
  updateMessage,
  deleteMessage,
} = require("../controllers/messages");

router.post("/", auth, createMessage);
router.get("/chat/:chatId",auth, getMessagesByChat);
router.put("/:id", auth, updateMessage);
router.delete("/:id", auth, deleteMessage);

module.exports = router;