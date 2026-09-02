const express = require("express");
const auth = require("../auth/auth");

const {
  createChat,
  getAllChats,
  getChatById,
  getChatByRoomId,
  deleteChat
} = require("../controllers/chats");

const router = express.Router();

router.post("/", auth, createChat);
router.get("/", auth, getAllChats);
router.get("/room/:roomId", auth, getChatByRoomId);
router.get("/:id", auth, getChatById);
router.delete("/:id", auth, deleteChat);

module.exports = router;