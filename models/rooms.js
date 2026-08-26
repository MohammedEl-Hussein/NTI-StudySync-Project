const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },
        categoryIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
                required: true
            }
        ],
        level: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        maxMembers: {
            type: Number,
            required: true,
            min: 2,
            max: 150
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true,
        },
        meetingURL: {
            type: String,
            trim: true
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        adminIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Room", roomSchema);