const mongoose = require("mongoose");

const taskModel = require("../models/tasks");
const Notification = require("../models/notifications");
const taskCompletionModel = require("../models/taskCompletion");
const roomModel = require("../models/rooms");
const Progress = require("../models/progresses");

//create task
const createTask = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { roomId, section, title, description, dueDate } = req.body;

    if (!roomId || !section || !title) {
      return res.status(400).json({
        message: "roomId, section and title are required"
      });
    }

    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in token"
      });
    }

    session.startTransaction();

    const room = await roomModel.findById(roomId).session(session);

    if (!room) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Room not found"
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
      await session.abortTransaction();

      return res.status(403).json({
        message: "You are not allowed to manage tasks in this room"
      });
    }

    const cleanSection = section.trim();
    const cleanTitle = title.trim();

    if (!cleanSection || !cleanTitle) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Section and title cannot be empty"
      });
    }

    // Check duplicate task
    const existingTask = await taskModel.findOne({
      roomId,
      section: cleanSection,
      title: cleanTitle
    }).session(session);

    if (existingTask) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "This task already exists in this section"
      });
    }

    // Get last order
    const lastTask = await taskModel
      .findOne({ roomId })
      .sort({ order: -1 })
      .session(session);

    const newOrder = lastTask
      ? lastTask.order + 1
      : 1;

    // Create task
    const createdTask = await taskModel.create(
      [
        {
          roomId,
          section: cleanSection,
          title: cleanTitle,
          description,
          order: newOrder,
          dueDate
        }
      ],
      { session }
    );

    // Update Progress for ALL users in this room
    const progresses = await Progress.find({
      roomId
    }).session(session);

    for (const progress of progresses) {
      progress.totalTasks += 1;

      progress.percentage =
        progress.totalTasks > 0
          ? Number(
              (
                (progress.completedTasks /
                  progress.totalTasks) *
                100
              ).toFixed(2)
            )
          : 0;

      await progress.save({ session });
    }

    await session.commitTransaction();

    
    // --- NOTIFICATION LOGIC ---
    try {
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      
      const roomForNotif = await require("../models/rooms").findById(roomId);
      
      if (io && connectedUsers && roomForNotif) {
        const members = await require("../models/roomMembers").find({ roomId, userId: { $ne: req.user.id } });
        for (const member of members) {
          const notification = new Notification({
            recipient: member.userId,
            type: 'task',
            title: `New Task in ${roomForNotif.title}`,
            message: `A new task "${title}" was added to your room`,
            link: `/rooms/${roomId}/study-plan`
          });
          await notification.save();
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

    return res.status(201).json({
      message: "Task created successfully",
      data: createdTask[0]
    });

  } catch (error) {

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate task data"
      });
    }

    return res.status(500).json({
      message: "Error creating task",
      error: error.message
    });

  } finally {
    await session.endSession();
  }
};

//updateTask
const updateTask = async (req, res) => {
  try {

    const taskId = req.params.id;

    // Find task
    const task = await taskModel.findById(taskId);
    if (!task) 
      return res.status(404).json({message: "Task not found"});
    
    // Find room
    const room = await roomModel.findById(task.roomId);
    if (!room) 
      return res.status(404).json({message: "Room not found"});
    
    // Current user
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    if (!userId) 
      return res.status(401).json({message: "User ID not found in token"});

    // Permissions
    const isOwner = room.ownerId && String(room.ownerId) === String(userId);
    const isRoomAdmin =
      Array.isArray(room.adminIds) &&
      room.adminIds.some(
        (adminId) => String(adminId) === String(userId)
      );
    const isPlatformAdmin = req.user.role === "admin";
    if (!isOwner && !isRoomAdmin && !isPlatformAdmin) 
      return res.status(403).json({message:"You are not allowed to manage tasks in this room"});

    // we can not change room id 
    // we can not update order here
    const { section, title, description, dueDate} = req.body;
    const updateData = {};

    if (section !== undefined) 
      updateData.section = section.trim();

    if (title !== undefined) 
      updateData.title = title.trim();

    if (description !== undefined) 
      updateData.description = description;

    if (dueDate !== undefined) 
      updateData.dueDate = dueDate;

    const newSection =section !== undefined? section.trim(): task.section;
    const newTitle =title !== undefined ? title.trim() : task.title;

    if ( section !== undefined || title !== undefined){
      const existingTask = await taskModel.findOne({ roomId: task.roomId, section: newSection, title: newTitle, _id: {$ne: taskId }});

      if (existingTask) 
        return res.status(400).json({message:"A task with this title already exists in this section"});
    }


    // Update task

    const updatedTask =
      await taskModel.findByIdAndUpdate(taskId,updateData,{new: true, runValidators: true});

    return res.status(200).json({message: "Task updated successfully",data: updatedTask});

  } catch (err) {
     console.error(err);

    // MongoDB duplicate index
    if (err.code === 11000) 
    return res.status(400).json({message: "Duplicate task data"});
    
    return res.status(500).json({message: err.message});
  }
};

// reorder tasks  ex: task from order 3 to order 1 

const reorderTask = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const taskId = req.params.id;
    const { newOrder } = req.body;
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (
      newOrder === undefined ||
      !Number.isInteger(newOrder) ||
      newOrder < 1
    ) {
      return res.status(400).json({
        message: "newOrder must be a positive integer"
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in token"
      });
    }

    session.startTransaction();

    const task = await taskModel
      .findById(taskId)
      .session(session);

    if (!task) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Task not found"
      });
    }

    const room = await roomModel
      .findById(task.roomId)
      .session(session);

    if (!room) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Room not found"
      });
    }

    // Permissions
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
      await session.abortTransaction();

      return res.status(403).json({
        message: "You are not allowed to manage tasks in this room"
      });
    }

    const totalTasks = await taskModel
      .countDocuments({
        roomId: task.roomId
      })
      .session(session);

    if (newOrder > totalTasks) {
      await session.abortTransaction();

      return res.status(400).json({
        message: `newOrder must be between 1 and ${totalTasks}`
      });
    }

    if (newOrder === task.order) {
      await session.abortTransaction();

      return res.status(200).json({
        message: "Task order is already correct",
        data: task
      });
    }

    const oldOrder = task.order;

    //Move current task temporarily outside the normal range to avoid unique index conflicts.
    await taskModel.updateOne(
      { _id: taskId },
      {
        $set: {
          order: -(oldOrder)
        }
      },
      { session }
    );

    //Shift other tasks.
    if (newOrder > oldOrder) {

      await taskModel.updateMany(
        {
          roomId: task.roomId,
          order: {
            $gt: oldOrder,
            $lte: newOrder
          }
        },
        {
          $inc: {
            order: -1
          }
        },
        { session }
      );

    } else {

      await taskModel.updateMany(
        {
          roomId: task.roomId,
          order: {
            $gte: newOrder,
            $lt: oldOrder
          }
        },
        {
          $inc: {
            order: 1
          }
        },
        { session }
      );
    }

    //Put moved task in its new position.
    await taskModel.updateOne(
      { _id: taskId },
      {
        $set: {
          order: newOrder
        }
      },
      { session }
    );

    const updatedTask = await taskModel
      .findById(taskId)
      .session(session);

    await session.commitTransaction();

    return res.status(200).json({
      message: "Task reordered successfully",
      data: updatedTask
    });

  } catch (error) {

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(error);

    return res.status(500).json({
      message: "Error reordering task",
      error: error.message
    });

  } finally {
    await session.endSession();
  }
};

//delete task
const deleteTask = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const taskId = req.params.id;
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in token"
      });
    }

    session.startTransaction();

    const task = await taskModel
      .findById(taskId)
      .session(session);

    if (!task) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Task not found"
      });
    }

    const room = await roomModel
      .findById(task.roomId)
      .session(session);

    if (!room) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Room not found"
      });
    }

    // Permissions
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
      await session.abortTransaction();

      return res.status(403).json({
        message: "You are not allowed to manage tasks in this room"
      });
    }

    // Find users who completed this task
    const completions = await taskCompletionModel
      .find({ taskId })
      .session(session);

    // Delete completions
    await taskCompletionModel.deleteMany(
      { taskId },
      { session }
    );

    // Update Progress
    for (const completion of completions) {

      const progress = await Progress.findOne({
        userId: completion.userId,
        roomId: task.roomId
      }).session(session);

      if (progress) {

        if (progress.completedTasks > 0) {
          progress.completedTasks -= 1;
        }

        if (progress.totalTasks > 0) {
          progress.totalTasks -= 1;
        }

        progress.percentage =
          progress.totalTasks > 0
            ? Number(
                (
                  (progress.completedTasks /
                    progress.totalTasks) *
                  100
                ).toFixed(2)
              )
            : 0;

        await progress.save({ session });
      }
    }

    // Users who did NOT complete the task
    // still need totalTasks decreased
    const completedUserIds = completions.map(
      (completion) => completion.userId.toString()
    );

    await Progress.updateMany(
      {
        roomId: task.roomId,
        userId: {
          $nin: completions.map(
            (completion) => completion.userId
          )
        },
        totalTasks: {
          $gt: 0
        }
      },
      {
        $inc: {
          totalTasks: -1
        }
      },
      {
        session
      }
    );

    // Recalculate percentage for users who did NOT complete task
    const remainingProgresses = await Progress.find({
      roomId: task.roomId,
      userId: {
        $nin: completions.map(
          (completion) => completion.userId
        )
      }
    }).session(session);

    for (const progress of remainingProgresses) {

      progress.percentage =
        progress.totalTasks > 0
          ? Number(
              (
                (progress.completedTasks /
                  progress.totalTasks) *
                100
              ).toFixed(2)
            )
          : 0;

      await progress.save({ session });
    }

    // Delete task
    await taskModel.findByIdAndDelete(
      taskId,
      { session }
    );

    // Fix task order
    await taskModel.updateMany(
      {
        roomId: task.roomId,
        order: {
          $gt: task.order
        }
      },
      {
        $inc: {
          order: -1
        }
      },
      {
        session
      }
    );

    await session.commitTransaction();

    return res.status(200).json({
      message: "Task deleted successfully",
      data: task,
      deletedCompletions: completions.length
    });

  } catch (error) {

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(error);

    return res.status(500).json({
      message: "Error deleting task",
      error: error.message
    });

  } finally {
    await session.endSession();
  }
};

//getAllTasks
const getAllTasks = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Check room
    const room = await roomModel.findById(roomId);
    if (!room) 
      return res.status(404).json({message: "Room not found"});

    // Get tasks by order
    const foundTasks = await taskModel.find({ roomId }).sort({ order: 1});
    return res.status(200).json({message:"All tasks retrieved successfully",data: foundTasks});

  } catch (err) {
    console.error(err);
    return res.status(500).json({message: err.message});
  }
};

//getTasksBySection
const getTasksBySection = async (req, res) => {
  try {
    const {roomId,section} = req.params;

    // Check room
    const room =await roomModel.findById(roomId);
    if (!room) 
      return res.status(404).json({message: "Room not found"});
    
    // Get tasks
    const foundTasks =await taskModel.find({roomId,section}).sort({order: 1 });
    if (foundTasks.length === 0) 
      return res.status(404).json({message:"No tasks found in this section"});
    
    return res.status(200).json({message:"Tasks retrieved successfully",data: foundTasks});

   } catch (err) {
    console.error(err);
    return res.status(500).json({message: err.message});
  }
};

//getTasksByTitle
const getTasksByTitle = async (req, res) => {
  try {

    const {  roomId,  title} = req.params;

    // Check room
    const room =await roomModel.findById(roomId);
    if (!room) 
      return res.status(404).json({message: "Room not found"});

    // Search tasks
    const foundTasks = await taskModel.find(
      {roomId,title: {$regex: title,$options: "i"}}).sort({order: 1});

    if (foundTasks.length === 0)
      return res.status(404).json({message:"No tasks found with the given title in this room"});

    return res.status(200).json({message:"Tasks fetched successfully",data: foundTasks});

   } catch (err) {
    console.error(err);
    return res.status(500).json({message: err.message});
  }
};

//getTaskById
const getTaskById = async (req, res) => {
  try {

    const task =await taskModel.findById(req.params.id);
    if (!task) 
      return res.status(404).json({message: "Task not found"});
    
    return res.status(200).json({message:"Task fetched successfully",data: task});

   } catch (err) {
    console.error(err);
    return res.status(500).json({message: err.message});
  }
};

module.exports = {
createTask,
updateTask,
reorderTask,
deleteTask,
getAllTasks,
getTasksBySection,
getTasksByTitle,
getTaskById
};