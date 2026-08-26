const Progress = require("../models/progresses");

const createProgress = async (req, res) => {
  try {
    const { userId, roomId, completedTasks, totalTasks } = req.body;

    const existingProgress = await Progress.findOne({
      userId,
      roomId
    });

    if (existingProgress) {
      return res.status(400).json({
        message: "Progress already exists for this user in this room"
      });
    }

    const percentage =
      totalTasks > 0
        ? (completedTasks / totalTasks) * 100
        : 0;

    const progress = await Progress.create({
      userId,
      roomId,
      completedTasks,
      totalTasks,
      percentage
    });

    res.status(201).json({
      message: "Progress created successfully",
      progress
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating progress",
      error: error.message
    });
  }
};

const getAllProgresses = async (req, res) => {
  try {
    const progresses = await Progress.find();

    res.status(200).json(progresses);
  } catch (error) {
    res.status(500).json({
      message: "Error getting progresses",
      error: error.message
    });
  }
};

const getUserRoomProgress = async (req, res) => {
  try {
    const { userId, roomId } = req.params;

    const progress = await Progress.findOne({
      userId,
      roomId
    });

    if (!progress) {
      return res.status(404).json({
        message: "Progress not found"
      });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({
      message: "Error getting progress",
      error: error.message
    });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { completedTasks, totalTasks } = req.body;

    const percentage =
      totalTasks > 0
        ? (completedTasks / totalTasks) * 100
        : 0;

    const progress = await Progress.findByIdAndUpdate(
      id,
      {
        completedTasks,
        totalTasks,
        percentage
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!progress) {
      return res.status(404).json({
        message: "Progress not found"
      });
    }

    res.status(200).json({
      message: "Progress updated successfully",
      progress
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating progress",
      error: error.message
    });
  }
};

const deleteProgress = async (req, res) => {
  try {
    const { id } = req.params;

    const progress = await Progress.findByIdAndDelete(id);

    if (!progress) {
      return res.status(404).json({
        message: "Progress not found"
      });
    }

    res.status(200).json({
      message: "Progress deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting progress",
      error: error.message
    });
  }
};

module.exports = {
  createProgress,
  getAllProgresses,
  getUserRoomProgress,
  updateProgress,
  deleteProgress
};