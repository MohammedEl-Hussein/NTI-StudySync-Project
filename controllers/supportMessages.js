const SupportMessage = require("../models/supportMessages");
const Notification = require("../models/notifications");

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
      if (req.user.role !== "admin") {
  return res.status(403).json({
    message: "Access denied. Admins only",
  });
}
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
     if (req.user.role !== "admin") {
  return res.status(403).json({
    message: "Access denied. Admins only",
  });
}
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
// const updateSupportMessageStatus = async (req, res) => {
//   try {
//      if (req.user.role !== "admin") {
//   return res.status(403).json({
//     message: "Access denied. Admins only",
//   });
// }
//     const { id } = req.params;
//     const { status } = req.body;

//     const allowedStatuses = [
//       "pending",
//       "in_progress",
//       "resolved",
//     ];

//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({
//         message: "Invalid status",
//       });
//     }

//     const supportMessage = await SupportMessage.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!supportMessage) {
//       return res.status(404).json({
//         message: "Support message not found",
//       });
//     }

//     res.status(200).json({
//       message: "Status updated successfully",
//       data: supportMessage,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to update status",
//       error: error.message,
//     });
//   }
// };


// Admin updates status
const updateSupportMessageStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only",
      });
    }
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

    // --- إرسال الإشعار عند حل المشكلة ---
    if (status === "resolved") {
      try {
        const notification = new Notification({
          recipient: supportMessage.userId,
          type: "system",
          title: "تم حل مشكلتك",
          message: `تم حل مشكلتك بخصوص: "${supportMessage.subject}" بنجاح.`,
          link: `/support` // الرابط الخاص بصفحة الدعم لدى المستخدم في الفرونت
        });
        await notification.save();

        // إرسال الإشعار فورياً إذا كان المستخدم متصلاً الآن
        const io = req.app.get("io");
        const connectedUsers = req.app.get("connectedUsers");
        if (io && connectedUsers) {
          const userSocketId = connectedUsers.get(supportMessage.userId.toString());
          if (userSocketId) {
            io.to(userSocketId).emit("new_notification", notification);
          }
        }
      } catch (notifyErr) {
        console.error("Failed to send resolution notification:", notifyErr.message);
      }
    }
    // ------------------------------------

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