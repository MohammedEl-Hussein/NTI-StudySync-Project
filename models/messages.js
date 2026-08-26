const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  content: {
    type: String,
    required: true,
  },
  
  sentAt: {
    type: Date,
    default: Date.now,
  },
});
const message = mongoose.model("message", messageSchema);
module.exports = message;