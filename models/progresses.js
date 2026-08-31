const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
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

        completedTasks: {
            type: Number,
            default: 0,
            min: 0
        },

        totalTasks: {
            type: Number,
            default: 0,
            min: 0
        },

        percentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },

    {
        timestamps: true
    }
);


// One progress document per user per room
progressSchema.index(
    {
        userId: 1,
        roomId: 1
    },
    {
        unique: true
    }
);


// Useful indexes
progressSchema.index({
    userId: 1
});

progressSchema.index({
    roomId: 1
});


const Progress = mongoose.model(
    "Progress",
    progressSchema
);

module.exports = Progress;