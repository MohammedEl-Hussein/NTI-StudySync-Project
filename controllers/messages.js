const Message = require("../models/messages");

const createMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({
        message: "chatId and content are required",
      });
    }

    const newMessage = await Message.create({
      chatId,
      userId: req.user.id,
      content: content.trim(),
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

const getMessagesByChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate("userId", "name email")
      .sort({ sentAt: 1 });

    res.status(200).json({
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get messages",
      error: error.message,
    });
  }
};

const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if(!content?.trim()){
        return res.status(400).json({
            message:"Content is required",
        })
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }
    //only the message owner can edit it
    if (message.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only edit your own message",
      });
    }

    message.content = content;
    await message.save();

    res.status(200).json({
      message: "Message updated successfully",
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update message",
      error: error.message,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }
    //only the message owner can delete it
    if (message.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own message",
      });
    }

    await Message.findByIdAndDelete(id);

    res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

module.exports = {
  createMessage,
  getMessagesByChat,
  updateMessage,
  deleteMessage,
};