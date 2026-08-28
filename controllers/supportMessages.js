const SupportMessage = require("../models/supportMessages");

const createSupportMessage = async (req, res) => {
  try {
    const { type, subject, content } = req.body;

    if (!type || !subject?.trim() || !content?.trim()) {
      return res.status(400).json({
        message: "type, subject and content are required",
      });
    }

    const supportMessage = await SupportMessage.create({
      userId: req.user.id,
      type:type.trim(),
      subject: subject.trim(),
      content: content.trim(),
    });

    res.status(201).json({
      message: "Support message sent successfully",
      data: supportMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send support message",
      error: error.message,
    });
  }
};

// User gets his own support messages
const getMySupportMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get support messages",
      error: error.message,
    });
  }
};

// Admin gets all supportMessages
const getAllSupportMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get support messages",
      error: error.message,
    });
  }
};

const getSupportMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const supportMessage = await SupportMessage.findById(id)
      .populate("userId", "name email");

    if (!supportMessage) {
      return res.status(404).json({
        message: "Support message not found",
      });
    }

    res.status(200).json({
      data: supportMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get support message",
      error: error.message,
    });
  }
};

// Admin updates status
const updateSupportMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "in_progress",
      "resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const supportMessage = await SupportMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!supportMessage) {
      return res.status(404).json({
        message: "Support message not found",
      });
    }

    res.status(200).json({
      message: "Status updated successfully",
      data: supportMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update status",
      error: error.message,
    });
  }
};

module.exports = {
  createSupportMessage,
  getMySupportMessages,
  getAllSupportMessages,
  getSupportMessageById,
  updateSupportMessageStatus,
};