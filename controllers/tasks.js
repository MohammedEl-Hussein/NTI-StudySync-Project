const taskModel = require("../models/tasks");
const taskCompletionModel = require("../models/taskCompletion");
const roomModel = require("../models/rooms");

//support function to check if the user can manage tasks in the room
const canManageRoom = (room, userId) => {
  const isOwner = room.ownerId && room.ownerId.toString() === userId.toString();
  const isAdmin =
    Array.isArray(room.adminIds) &&
    room.adminIds.some(
      (adminId) => adminId.toString() === userId.toString()
    );

  return isOwner || isAdmin;
};

//create task
const createTask = async (req, res) => {
  try {
    const {
      roomId,
      section,
      title,
      description,
      dueDate
    } = req.body;

    // Validate required fields
    if (!roomId || !section || !title) {
      return res.status(400).json({
        message: "roomId, section and title are required"
      });
    }

    // Find room
    const checkRoom = await roomModel.findById(roomId);

    if (!checkRoom)
      return res.status(404).json({message: "Room not found"});
      

    // Get current user from JWT
    const userId = req.user?.userId;

    if (!userId) 
      return res.status(401).json({ message: "User ID not found in token"});
    
    // Room Owner
    const isOwner = checkRoom.ownerId && String(checkRoom.ownerId) === String(userId);

    // Room Admin
    const isRoomAdmin =
      Array.isArray(checkRoom.adminIds) &&
      checkRoom.adminIds.some(
        (adminId) => String(adminId) === String(userId)
      );

    // Platform Admin
    const isPlatformAdmin = req.user.role === "admin";

    // User must be one of them
    if (!isOwner && !isRoomAdmin && !isPlatformAdmin) 
      return res.status(403).json({message: "You are not allowed to manage tasks in this room"});

    const checkTask = await taskModel.findOne({roomId,title: title.trim()});

    if (checkTask) 
      return res.status(400).json({message: "This task already exists in this room"});
    
    const lastTask = await taskModel.findOne({ roomId }).sort({ order: -1 });
     const newOrder = lastTask ? lastTask.order + 1 : 1;

    const createdTask = await taskModel.create({
      roomId,
      section: section.trim(),
      title: title.trim(),
      description,
      order: newOrder,
      dueDate
    });

    return res.status(201).json({message: "Task created successfully",data: createdTask});

  } catch (err) {
    console.error(err);
    return res.status(500).json({message: err.message});
  }
};

// roomId cannot be changed

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Find task
    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Find room
    const room = await roomModel.findById(task.roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // Current user
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in token",
      });
    }

    // Check permissions
    const isOwner =
      room.ownerId &&
      String(room.ownerId) === String(userId);

    const isRoomAdmin =
      Array.isArray(room.adminIds) &&
      room.adminIds.some(
        (adminId) => String(adminId) === String(userId)
      );

    const isPlatformAdmin = req.user.role === "admin";

    if (!isOwner && !isRoomAdmin && !isPlatformAdmin) {
      return res.status(403).json({
        message: "You are not allowed to manage tasks in this room",
      });
    }

    // Get update data
    const {
      section,
      title,
      description,
      dueDate,
    } = req.body;

    const updateData = {};

    if (section !== undefined) {
      updateData.section = section.trim();
    }

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate;
    }

    // Check duplicate title
    if (title !== undefined) {
      const existingTask = await taskModel.findOne({
        roomId: task.roomId,
        title: title.trim(),
        _id: { $ne: taskId },
      });

      if (existingTask) {
        return res.status(400).json({
          message: "A task with this title already exists in this room",
        });
      }
    }

    // Update task
    const updatedTask = await taskModel.findByIdAndUpdate(
      taskId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Task updated successfully",
      data: updatedTask,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({message: err.message});
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Find task
    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Find room
    const room = await roomModel.findById(task.roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // Current user
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in token",
      });
    }

    // Check permissions
    const isOwner =
      room.ownerId &&
      String(room.ownerId) === String(userId);

    const isRoomAdmin =
      Array.isArray(room.adminIds) &&
      room.adminIds.some(
        (adminId) => String(adminId) === String(userId)
      );

    const isPlatformAdmin = req.user.role === "admin";

    if (!isOwner && !isRoomAdmin && !isPlatformAdmin) {
      return res.status(403).json({
        message: "You are not allowed to manage tasks in this room",
      });
    }

    // Delete all completions related to this task
    const deletedCompletions =
      await taskCompletionModel.deleteMany({
        taskId: taskId,
      });

    // Delete task
    await taskModel.findByIdAndDelete(taskId);

    // Shift orders
    await taskModel.updateMany(
      {
        roomId: task.roomId,
        order: {
          $gt: task.order,
        },
      },
      {
        $inc: {
          order: -1,
        },
      }
    );

    return res.status(200).json({
      message: "Task deleted successfully",
      data: task,
      deletedCompletions: deletedCompletions.deletedCount,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({message: err.message});
  }
};

const getAllTasks = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await roomModel.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    const foundTasks = await taskModel
      .find({ roomId })
      .sort({
        section: 1,
        order: 1
      });

    return res.status(200).json({
      message: "All tasks retrieved successfully",
      data: foundTasks
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({message: err.message});
  }
};

const getTasksBySection = async (req, res) => {
  try {
    const {
      roomId,
      section
    } = req.params;

    const room = await roomModel.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    const foundTasks = await taskModel
      .find({
        roomId,
        section
      })
      .sort({
        order: 1
      });

    if (foundTasks.length === 0) {
      return res.status(404).json({
        message: "No tasks found in this section"
      });
    }

    return res.status(200).json({
      message: "Tasks retrieved successfully",
      data: foundTasks
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({message: err.message});
  }
};

const getTasksByTitle = async (req, res) => {
  try {
    const {
      roomId,
      title
    } = req.params;

    const room = await roomModel.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    const foundTasks = await taskModel
      .find({
        roomId,
        title: {
          $regex: title,
          $options: "i"
        }
      })
      .sort({
        order: 1
      });

    if (foundTasks.length === 0) {
      return res.status(404).json({
        message:
          "No tasks found with the given title in this room"
      });
    }

    return res.status(200).json({
      message: "Tasks fetched successfully",
      data: foundTasks
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({message: err.message});
  }
};


const getTaskById = async (req, res) => {
  try {
    const task = await taskModel.findById(req.params.id);

    if (!task) 
      return res.status(404).json({message: "Task not found"});

    return res.status(200).json({message: "Task fetched successfully",data: task});

  } catch (err) {
    console.error(err);
    return res.status(500).json({message: err.message});
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  getAllTasks,
  getTasksBySection,
  getTasksByTitle,
  getTaskById
};