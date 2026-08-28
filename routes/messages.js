const express = require("express");
const router = express.Router();
const {
  createMessage,
  getMessagesByChat,
  updateMessage,
  deleteMessage,
} = require("../controllers/messages");

router.post("/", createMessage);
router.get("/chat/:chatId", getMessagesByChat);
router.put("/:id", updateMessage);
router.delete("/:id", deleteMessage);

module.exports = router;