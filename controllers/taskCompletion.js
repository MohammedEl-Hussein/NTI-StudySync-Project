const mongoose = require("mongoose");

const taskCompletionModel = require("../models/taskCompletion");
const taskModel = require("../models/tasks");
const roomMemberModel = require("../models/roomMembers");
const Progress = require("../models/progresses");

const completeTask = async (req, res) => {

    const session = await mongoose.startSession();

    try {

        const userId = req.user.userId;
        const { taskId } = req.body;

        if (!taskId)
            return res.status(400).json({ message: "taskId is required" });

        // Find task
        const task = await taskModel.findById(taskId).session(session);

        if (!task) 
            return res.status(404).json({message: "Task not found"});
        
        const member = await roomMemberModel.findOne({userId, roomId: task.roomId}).session(session);
        if (!member) 
            return res.status(403).json({ message: "You are not a member of this room" });
       
        const existingCompletion =
            await taskCompletionModel.findOne({userId,taskId}).session(session);
        if (existingCompletion) 
            return res.status(400).json({message: "You have already completed this task"});
        
        session.startTransaction();

        const completion =
            await taskCompletionModel.create(
                [ { userId, roomId: task.roomId, taskId: task._id}
                ],{session}
            );

        const progress =
            await Progress.findOneAndUpdate(
                { userId, roomId: task.roomId, $expr: {$lt: [ "$completedTasks", "$totalTasks" ]}},
                {$inc: {completedTasks: 1}},
                {new: true,session}
            );

        // Progress doesn't exist
        if (!progress) 
            throw new Error("Progress not found or completed tasks cannot exceed total tasks");

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


        await progress.save({session});
        await session.commitTransaction();
        return res.status(201).json({message: "Task completed successfully",data: {completion: completion[0],progress}});

    } catch (error) {
        // Rollback
        if (session.inTransaction()) {await session.abortTransaction();}
        console.error(error);
        // Duplicate completion
        if (error.code === 11000) 
            return res.status(400).json({message: "You have already completed this task"});

        return res.status(500).json({message: "Error completing task",error: error.message});

    } finally { await session.endSession();}
};

const unCompletedTask = async (req, res) => {

    const session = await mongoose.startSession();

    try {

        const userId = req.user.userId;
        const { taskId } = req.body;

        // Validate taskId
        if (!taskId) {
            return res.status(400).json({
                message: "taskId is required"
            });
        }

        // Find task
        const task = await taskModel
            .findById(taskId)
            .session(session);


        if (!task) 
            return res.status(404).json({message: "Task not found"});

        const member = await roomMemberModel
            .findOne({userId,roomId: task.roomId}).session(session);

        if (!member) 
            return res.status(403).json({message: "You are not a member of this room"});

        session.startTransaction();

        const completion =
            await taskCompletionModel.findOneAndDelete({userId,taskId},{session});

        if (!completion) {
            await session.abortTransaction();
            return res.status(404).json({message: "Task completion not found"});
        }

        const progress =
            await Progress.findOneAndUpdate(
                {userId,roomId: task.roomId,completedTasks: {$gt: 0}},
                {$inc: {completedTasks: -1}},
                {new: true,session}
              );

        if (!progress) 
          throw new Error("Progress not found");

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

        await progress.save({session});

        await session.commitTransaction();

        return res.status(200).json({message: "Task uncompleted successfully",data: {progress}});

    } catch (error) {

        if (session.inTransaction()) 
          await session.abortTransaction();
        console.error(error);
        return res.status(500).json({message: "Error uncompleting task",error: error.message});

    } finally {await session.endSession();}
};

const getCompletedTasksByUser = async (req, res) => {

    try {
        const userId = req.user.userId;

        const completed =
            await taskCompletionModel.find({userId}).populate("taskId").sort({completedAt: -1});
        
            return res.status(200).json({message:"Completed tasks retrieved successfully",data: completed});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Error getting completed tasks",error: error.message});
    }
};

module.exports = {

    completeTask,

    unCompletedTask,

    getCompletedTasksByUser

};