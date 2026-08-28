const taskCompletionModel=require("../models/taskCompletion")
const taskModel=require("../models/tasks")// to get the task
const roomMemberModel = require("../models/roomMembers");// to get the member or user

const completeTask=async(req,res) =>{
    try {
        const { userId, taskId } = req.body;

        // find the task
        const task = await taskModel.findById(taskId);
        if (!task) 
            return res.status(404).json({ message: "Task not found" });

        // check if the user is in this room
        const member = await roomMemberModel.findOne({ userId, roomId: task.roomId });
        if(!member)
            return res.status(403).json({ message: "You are not a member of this room" });

        const completed = await taskCompletionModel.findOne({ userId, taskId });
        if (completed)
            return res.status(400).json({ message: "You have already completed this task" });

        const completion  = await taskCompletionModel.create({userId, taskId: task._id, roomId: task.roomId})
        res.status(201).json({ message: "Task completed successfully", data: completion });

        } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const unCompletedTask=async(req,res) =>{
    try {
        const { userId, taskId } = req.body;

        const completed = await taskCompletionModel.findOne({ userId, taskId });
        if (!completed)
            return res.status(400).json({ message: "Task completion not found" });

        await taskCompletionModel.deleteOne({ userId, taskId });
        res.status(200).json({ message: "Task uncompleted successfully" });

    }catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getCompletedTask=async(req,res) =>{
    try {
        const { userId, taskId } = req.body;

        const completed = await taskCompletionModel.findOne({ userId, taskId });
        if (!completed)
            return res.status(404).json({ message: "Task completion not found" });

        res.status(200).json({ message: "Task completion retrieved successfully", data: completed });

    }catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getCompletedTasksByUser=async(req,res) =>{
    try {
        const { userId } = req.body;

        const completed = await taskCompletionModel.find({userId});
        if (completed.length === 0)
            return res.status(404).json({ message: "No completed tasks found for you" });

        res.status(200).json({ message: "Completed tasks retrieved successfully", data: completed });

    }catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports={
    completeTask,
    unCompletedTask,
    getCompletedTask,
    getCompletedTasksByUser
}