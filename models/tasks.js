const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    section: {
      type: String,
      required: true
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    order: {
      type: Number,
      required: true,
      min: 1
    },

    dueDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index(
  {
    roomId: 1,
    section: 1,
    order: 1
  },
  {
    unique: true
  }
);

const taskModel = mongoose.model("Task", taskSchema);

module.exports = taskModel;
