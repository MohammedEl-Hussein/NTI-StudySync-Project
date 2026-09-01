const Progress = require("../models/progresses");
const Task = require("../models/tasks");

// This should be called when a user joins a room
const createProgress = async (req, res) => {

    try {

        const userId = req.user.userId;
        const { roomId } = req.body;

        if (!userId) 
            return res.status(401).json({message: "User not authenticated"});

        if (!roomId) 
            return res.status(400).json({message: "roomId is required"});
        
        // Check if progress already exists
        const existingProgress =
            await Progress.findOne({userId,roomId});

        if (existingProgress) 
            return res.status(400).json({message:"Progress already exists for this user in this room"});

        // Count room tasks
        const totalTasks =
            await Task.countDocuments({roomId});

        // Create progress
        const progress =
            await Progress.create({
            userId,
            roomId,
            completedTasks: 0,
            totalTasks,
            percentage: 0
        });

        return res.status(201).json({message:"Progress created successfully",data: progress});
    
    } catch (error) {

        console.error(error);
        return res.status(500).json({message:"Error creating progress",error: error.message});
    }
};

const getAllProgresses = async (req, res) => {

    try {

        const userId = req.user.userId;

        const progresses =
            await Progress.find({userId}).populate("roomId");

        return res.status(200).json({message:"Progresses retrieved successfully",data: progresses});
    } catch (error) {

        console.error(error);

        return res.status(500).json({message:"Error getting progresses",error: error.message});
    }
};

const getUserRoomProgress = async (req, res) => {

    try {

        const userId = req.user.userId;
        const { roomId } = req.params;


        if (!roomId) 
            return res.status(400).json({message: "roomId is required"});
        
        const progress =await Progress.findOne({userId,roomId});

        if (!progress) 
            return res.status(404).json({message: "Progress not found"});
        
        return res.status(200).json({message:"Progress retrieved successfully",data: progress});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Error getting progress",error: error.message});
    }
};

// Call this when a new task is added to a room
const increaseTotalTasks = async (roomId) => {

    try {
        const progresses =
            await Progress.find({roomId});

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


            await progress.save();
        }
        return progresses;

    } catch (error) {
        throw new Error(`Error increasing total tasks: ${error.message}`);
    }
};



// =====================================================
// DECREASE TOTAL TASKS
// =====================================================

// Call this when a task is deleted
//
// IMPORTANT:
// This function alone is not enough when deleting a task
// because we must know which users completed that task.
//
// The actual task deletion logic should handle:
// - deleting TaskCompletion
// - decreasing completedTasks for affected users
// - decreasing totalTasks for all users
//
// Therefore this helper should NOT be used alone for
// deleting tasks.

const decreaseTotalTasks = async (roomId) => {

    try {

        const progresses = await Progress.find({roomId});

        for (const progress of progresses) {

            if (progress.totalTasks > 0) 
                progress.totalTasks -= 1;

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

            await progress.save();
        }
        return progresses;

    } catch (error) {

        throw new Error(`Error decreasing total tasks: ${error.message}`);
    }
};

module.exports = {
createProgress,
getAllProgresses,
getUserRoomProgress,
increaseTotalTasks,
decreaseTotalTasks
};