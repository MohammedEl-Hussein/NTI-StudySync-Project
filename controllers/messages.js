const Message = require("../models/messages");
const Chat = require("../models/chats");
const RoomMember = require("../models/roomMembers");
const Room = require("../models/rooms");
const Notification = require("../models/notifications");

const createMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({
        message: "chatId and content are required",
      });
    }
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    const userId = req.user.id || req.user._id;
    const isSuperAdmin = req.user.role === "admin";

    const member = await RoomMember.findOne({
      roomId: chat.roomId,
      userId: userId,
    });

    if (!isSuperAdmin && !member) {
      return res.status(403).json({
        message: "You are not a member of this room",
      });
    }

    const newMessage = await Message.create({
      chatId,
      userId: userId,
      content: content.trim(),
    });

    
    // --- NOTIFICATION LOGIC ---
    try {
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      
      // We already fetched chat and room above:
      // const chat = await Chat.findById(chatId);
      // We need room for the title:
      const roomForNotif = await Room.findById(chat.roomId);
      
      if (io && connectedUsers && roomForNotif) {
        const members = await RoomMember.find({ roomId: chat.roomId, userId: { $ne: userId } });
        for (const member of members) {
          let notification = await Notification.findOne({
            recipient: member.userId,
            type: 'chat',
            link: `/rooms/${chat.roomId}/chat`,
            isRead: false
          });

          if (notification) {
            const match = notification.message.match(/You have (\d+) new/);
            let count = match ? parseInt(match[1]) + 1 : 2;
            notification.message = `You have ${count} new unread messages in ${roomForNotif.title}`;
            notification.createdAt = new Date();
            await notification.save();
          } else {
            notification = new Notification({
              recipient: member.userId,
              type: 'chat',
              title: `New Message in ${roomForNotif.title}`,
              message: `You have 1 new unread message in ${roomForNotif.title}`,
              link: `/rooms/${chat.roomId}/chat`
            });
            await notification.save();
          }
          const socketId = connectedUsers.get(member.userId.toString());
          if (socketId) {
            io.to(socketId).emit('new_notification', notification);
          }
        }
      }
    } catch (err) {
      console.error('Error sending notification', err);
    }
    // --------------------------

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
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    const userId = req.user.id || req.user._id;
    const isSuperAdmin = req.user.role === "admin";

    const member = await RoomMember.findOne({
      roomId: chat.roomId,
      userId: userId,
    });

    if (!isSuperAdmin && !member) {
      return res.status(403).json({
        message: "You are not a member of this room",
      });
    }

    const messages = await Message.find({ chatId })
      .populate("userId", "name email role")
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

    const userId = (req.user.id || req.user._id)?.toString();
    const isSuperAdmin = req.user.role === "admin";

    // Only the message owner or Super Admin can edit it
    if (!isSuperAdmin && message.userId.toString() !== userId) {
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

    // Get the chat
    const chat = await Chat.findById(message.chatId);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    // Get the room
    const room = await Room.findById(chat.roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // 1. Safely extract user ID and super admin role
    const userId = (req.user.id || req.user._id)?.toString();
    const isSuperAdmin = req.user.role === "admin";

    // 2. Permission checks
    const isMessageOwner =
      userId && message.userId?.toString() === userId;

    const isRoomOwner =
      userId && room.ownerId?.toString() === userId;

    const isRoomAdmin =
      userId &&
      room.adminIds?.some((adminId) => {
        const aId = adminId._id || adminId.id || adminId;
        return aId && aId.toString() === userId;
      });

    // Super Admins, Message Owners, Room Owners, and Room Admins can all delete messages
    if (!isSuperAdmin && !isMessageOwner && !isRoomOwner && !isRoomAdmin) {
      return res.status(403).json({
        message: "You are not allowed to delete this message",
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