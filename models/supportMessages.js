const mongoose = require("mongoose");
const supportMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim:true,
    },

    content: {
      type: String,
      required: true,
      trim:true,
    },

    status: {
      type: String,
      enum:["pending","in_progress","resolved"],
      default: "pending",
    },
  },
  {
    // Adds createdAt and updatedAt automatically
    timestamps: true,
  }
);
const supportMessage = mongoose.model("supportMessage",supportMessageSchema);
module.exports = supportMessage