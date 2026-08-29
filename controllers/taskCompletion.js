
const taskCompletionModel = require("../models/taskCompletion");
const taskModel = require("../models/tasks");
const roomMemberModel = require("../models/roomMembers");

// ============================================================
// COMPLETE TASK
// ============================================================

const completeTask = async (req, res) => {
  try {
    // IMPORTANT:
    // Your JWT contains userId, not id
    const userId = req.user.userId;

    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({
        message: "taskId is required"
      });
    }

    // Find task
    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // ========================================================
    // ADMIN
    // ========================================================
    // Global admin can complete tasks without being
    // explicitly stored in RoomMember
    // ========================================================

    const isAdmin = req.user.role === "admin";

    if (!isAdmin) {

      // Normal user must be a member of the room
      const member = await roomMemberModel.findOne({
        userId,
        roomId: task.roomId
      });

      if (!member) {
        return res.status(403).json({
          message: "You are not a member of this room"
        });
      }
    }

    // ========================================================
    // Check if task is already completed
    // ========================================================

    const completed = await taskCompletionModel.findOne({
      userId,
      taskId
    });

    if (completed) {
      return res.status(400).json({
        message: "You have already completed this task"
      });
    }

    // ========================================================
    // Create completion
    // ========================================================

    const completion = await taskCompletionModel.create({
      userId,
      taskId: task._id,
      roomId: task.roomId
    });

    return res.status(201).json({
      message: "Task completed successfully",
      data: completion
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error completing task",
      error: error.message
    });
  }
};


// ============================================================
// UNCOMPLETE TASK
// ============================================================

const unCompletedTask = async (req, res) => {
  try {

    // JWT contains userId
    const userId = req.user.userId;

    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({
        message: "taskId is required"
      });
    }

    // Find task first
    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // ========================================================
    // ADMIN
    // ========================================================

    const isAdmin = req.user.role === "admin";

    if (!isAdmin) {

      const member = await roomMemberModel.findOne({
        userId,
        roomId: task.roomId
      });

      if (!member) {
        return res.status(403).json({
          message: "You are not a member of this room"
        });
      }
    }

    // ========================================================
    // Find completion
    // ========================================================

    const completed = await taskCompletionModel.findOne({
      userId,
      taskId
    });

    if (!completed) {
      return res.status(404).json({
        message: "Task completion not found"
      });
    }

    await taskCompletionModel.deleteOne({
      userId,
      taskId
    });

    return res.status(200).json({
      message: "Task uncompleted successfully"
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error uncompleting task",
      error: error.message
    });
  }
};


// ============================================================
// GET COMPLETED TASK
// ============================================================

const getCompletedTask = async (req, res) => {
  try {

    const userId = req.user.userId;

    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({
        message: "taskId is required"
      });
    }

    const completed = await taskCompletionModel.findMany({
      userId,
      taskId
    });

    if (!completed) {
      return res.status(404).json({
        message: "Task completion not found"
      });
    }

    return res.status(200).json({
      message: "Task completion retrieved successfully",
      data: completed
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error getting task completion",
      error: error.message
    });
  }
};


// ============================================================
// GET ALL COMPLETED TASKS BY CURRENT USER
// ============================================================

const getCompletedTasksByUser = async (req, res) => {
  try {

    const userId = req.user.userId;

    const completed = await taskCompletionModel.find({
      userId
    });

    return res.status(200).json({
      message: "Completed tasks retrieved successfully",
      data: completed
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error getting completed tasks",
      error: error.message
    });
  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  completeTask,
  unCompletedTask,
  getCompletedTask,
  getCompletedTasksByUser
};
