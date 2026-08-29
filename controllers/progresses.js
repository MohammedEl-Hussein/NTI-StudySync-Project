const Progress = require("../models/progresses");

const createProgress = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { roomId, completedTasks, totalTasks } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "Invalid user information"
            });
        }

        if (!roomId) {
            return res.status(400).json({
                message: "roomId is required"
            });
        }

        if (completedTasks === undefined || totalTasks === undefined) {
            return res.status(400).json({
                message: "completedTasks and totalTasks are required"
            });
        }

        if (completedTasks < 0 || totalTasks < 0) {
            return res.status(400).json({
                message: "Task numbers cannot be negative"
            });
        }

        if (completedTasks > totalTasks) {
            return res.status(400).json({
                message: "completedTasks cannot be greater than totalTasks"
            });
        }

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
        const userId = req.user.id || req.user._id;

        const progresses = await Progress.find({ userId });

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
        const userId = req.user.id || req.user._id;
        const { roomId } = req.params;

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
        const userId = req.user.id || req.user._id;
        const { id } = req.params;
        const { completedTasks, totalTasks } = req.body;

        if (completedTasks === undefined || totalTasks === undefined) {
            return res.status(400).json({
                message: "completedTasks and totalTasks are required"
            });
        }

        if (completedTasks < 0 || totalTasks < 0) {
            return res.status(400).json({
                message: "Task numbers cannot be negative"
            });
        }

        if (completedTasks > totalTasks) {
            return res.status(400).json({
                message: "completedTasks cannot be greater than totalTasks"
            });
        }

        const percentage =
            totalTasks > 0
                ? (completedTasks / totalTasks) * 100
                : 0;

        const progress = await Progress.findOneAndUpdate(
            {
                _id: id,
                userId
            },
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
        const userId = req.user.id || req.user._id;
        const { id } = req.params;

        const progress = await Progress.findOneAndDelete({
            _id: id,
            userId
        });

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