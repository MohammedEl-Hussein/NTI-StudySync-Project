const express = require("express");

const {
  createChat,
  getAllChats,
  getChatById,
  getChatByRoomId,
  deleteChat
} = require("../controllers/chats");

const router = express.Router();

router.post("/", createChat);

router.get("/", getAllChats);

router.get("/room/:roomId", getChatByRoomId);

router.get("/:id", getChatById);

router.delete("/:id", deleteChat);

module.exports = router;