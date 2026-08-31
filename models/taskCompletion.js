const mongoose = require("mongoose");

const taskCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },

    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// One user can complete a task only once
taskCompletionSchema.index(
  { userId: 1, taskId: 1 },
  { unique: true }
);

taskCompletionSchema.index({ userId: 1 });
taskCompletionSchema.index({ roomId: 1 });
taskCompletionSchema.index({ taskId: 1 });

const TaskCompletion = mongoose.model(
  "TaskCompletion",
  taskCompletionSchema
);

module.exports = TaskCompletion;
