const Chat = require("../models/chats");

const createChat = async (req, res) => {
  try {
    const { roomId } = req.body;

    const existingChat = await Chat.findOne({
      roomId
    });

    if (existingChat) {
      return res.status(400).json({
        message: "Chat already exists for this room"
      });
    }

    const chat = await Chat.create({
      roomId
    });

    res.status(201).json({
      message: "Chat created successfully",
      chat
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating chat",
      error: error.message
    });
  }
};

const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find();

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({
      message: "Error getting chats",
      error: error.message
    });
  }
};

const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({
      message: "Error getting chat",
      error: error.message
    });
  }
};

const getChatByRoomId = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      roomId: req.params.roomId
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found for this room"
      });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({
      message: "Error getting room chat",
      error: error.message
    });
  }
};

const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }

    res.status(200).json({
      message: "Chat deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting chat",
      error: error.message
    });
  }
};

module.exports = {
  createChat,
  getAllChats,
  getChatById,
  getChatByRoomId,
  deleteChat
};