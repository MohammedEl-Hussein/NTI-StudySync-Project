const mongoose = require("mongoose");
const Room = require("../models/rooms");
const Category = require("../models/categories");
const User = require("../models/users");
const Chat = require("../models/chats");
const Message = require("../models/messages");
const RoomMember = require("../models/roomMembers");
const Progress = require("../models/progresses");
const Task = require("../models/tasks");
const TaskCompletion = require("../models/taskCompletion");


// ===============================
// Create Room
// ===============================
const createRoom = async (req, res) => {
    try {
        const {
            title,
            categoryIds,
            level,
            description,
            maxMembers,
            startDate,
            endDate,
            meetingURL
        } = req.body;

        // 1. Check required fields
        if (
            !title ||
            !categoryIds ||
            !level ||
            maxMembers === undefined ||
            !startDate ||
            !endDate
        ) {
            return res.status(400).json({
                message: "Please provide all required room data"
            });
        }

        // 2. Validate maxMembers
        const parsedMaxMembers = Number(maxMembers);
        if (!Number.isInteger(parsedMaxMembers) || parsedMaxMembers < 2 || parsedMaxMembers > 150) {
            return res.status(400).json({
                message: "maxMembers must be an integer between 2 and 150"
            });
        }

        // 3. Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                message: "Invalid startDate or endDate format"
            });
        }
        if (end <= start) {
            return res.status(400).json({
                message: "End date must be after start date"
            });
        }

        // 4. Validate categoryIds
        if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
            return res.status(400).json({
                message: "categoryIds must be a non-empty array"
            });
        }
        const hasInvalidCategoryObjectId = categoryIds.some(id => !mongoose.Types.ObjectId.isValid(id));
        if (hasInvalidCategoryObjectId) {
            return res.status(400).json({
                message: "One or more categoryIds are invalid ObjectIds"
            });
        }
        const uniqueCategoryIds = [...new Set(categoryIds.map(id => id.toString()))];
        const validCategoriesCount = await Category.countDocuments({
            _id: { $in: uniqueCategoryIds }
        });
        if (validCategoriesCount !== uniqueCategoryIds.length) {
            return res.status(400).json({
                message: "One or more categoryIds do not exist in categories"
            });
        }

        // The logged-in user becomes the owner
        const ownerId = req.user.id || req.user._id;

        // 5. Create Room
        const room = await Room.create({
            title,
            categoryIds: uniqueCategoryIds,
            level,
            description,
            maxMembers: parsedMaxMembers,
            startDate: start,
            endDate: end,
            meetingURL,
            ownerId,
            // The owner is also initially a room admin
            adminIds: [ownerId]
        });

        // 6. Create Chat for the Room
        await Chat.create({
            roomId: room._id
        });

        // 7. Create RoomMember for Owner
        await RoomMember.create({
            userId: ownerId,
            roomId: room._id
        });

        // 8. Create Progress for Owner
        await Progress.create({
            userId: ownerId,
            roomId: room._id,
            completedTasks: 0,
            totalTasks: 0,
            percentage: 0
        });

        res.status(201).json({
            message: "Room created successfully",
            data: room
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};



// ===============================
// Get All Rooms
// ===============================
const getRooms = async (req, res) => {
    try {
        // to show the data of the referenced collections not only the id
        const rooms = await Room.find()
            .populate("categoryIds")
            .populate("ownerId", "name email")
            .populate("adminIds", "name email");

        res.status(200).json({
            message: "Rooms retrieved successfully",
            data: rooms
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};


// ===============================
// Get Room By ID
// ===============================
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate("categoryIds")
            .populate("ownerId", "name email")
            .populate("adminIds", "name email");

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        res.status(200).json({
            message: "Room retrieved successfully",
            data: room
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};



// ===============================
// Update Room
// ===============================
const updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        const userId = req.user.id || req.user._id;

        // ===============================
        // Check user permissions
        // ===============================

        const isSuperAdmin = req.user.role === "admin";
        const isOwner = room.ownerId.toString() === userId.toString();
        const isRoomAdmin =
            room.adminIds.some(
                adminId => adminId.toString() === userId.toString()
            );

        // Normal users cannot update the room
        if (!isSuperAdmin && !isOwner && !isRoomAdmin) {
            return res.status(403).json({
                message: "You are not allowed to update this room"
            });
        }

        // ===============================
        // Prevent ownerId modification
        // ===============================
        if (req.body.ownerId !== undefined) {
            return res.status(403).json({
                message: "Room ownership cannot be changed through this operation"
            });
        }

        // ===============================
        // Allowed normal fields
        // ===============================
        const allowedFields = [
            "title",
            "level",
            "description",
            "meetingURL"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        // ===============================
        // Validate & Update categoryIds
        // ===============================
        if (req.body.categoryIds !== undefined) {
            if (!Array.isArray(req.body.categoryIds) || req.body.categoryIds.length === 0) {
                return res.status(400).json({
                    message: "categoryIds must be a non-empty array"
                });
            }
            const hasInvalidCategoryObjectId = req.body.categoryIds.some(id => !mongoose.Types.ObjectId.isValid(id));
            if (hasInvalidCategoryObjectId) {
                return res.status(400).json({
                    message: "One or more categoryIds are invalid ObjectIds"
                });
            }
            const uniqueCategoryIds = [...new Set(req.body.categoryIds.map(id => id.toString()))];
            const validCategoriesCount = await Category.countDocuments({
                _id: { $in: uniqueCategoryIds }
            });
            if (validCategoriesCount !== uniqueCategoryIds.length) {
                return res.status(400).json({
                    message: "One or more categoryIds do not exist in categories"
                });
            }
            updates.categoryIds = uniqueCategoryIds;
        }

        // ===============================
        // Validate & Update maxMembers
        // ===============================
        if (req.body.maxMembers !== undefined) {
            const parsedMaxMembers = Number(req.body.maxMembers);
            if (!Number.isInteger(parsedMaxMembers) || parsedMaxMembers < 2 || parsedMaxMembers > 150) {
                return res.status(400).json({
                    message: "maxMembers must be an integer between 2 and 150"
                });
            }

            const currentMemberCount = await RoomMember.countDocuments({ roomId: room._id });
            if (parsedMaxMembers < currentMemberCount) {
                return res.status(400).json({
                    message: `maxMembers (${parsedMaxMembers}) cannot be less than the current member count (${currentMemberCount})`
                });
            }

            updates.maxMembers = parsedMaxMembers;
        }

        // ===============================
        // Validate & Update adminIds
        // ===============================
        if (req.body.adminIds !== undefined) {
            if (!isOwner && !isSuperAdmin) {
                return res.status(403).json({
                    message: "Only the room owner or a super admin can manage room admins"
                });
            }
            if (!Array.isArray(req.body.adminIds)) {
                return res.status(400).json({
                    message: "adminIds must be an array"
                });
            }
            const hasInvalidUserObjectId = req.body.adminIds.some(id => !mongoose.Types.ObjectId.isValid(id));
            if (hasInvalidUserObjectId) {
                return res.status(400).json({
                    message: "One or more admin user IDs are invalid ObjectIds"
                });
            }

            const adminIdStrings = req.body.adminIds.map(id => id.toString());
            // Ensure owner remains an admin
            if (!adminIdStrings.includes(room.ownerId.toString())) {
                adminIdStrings.push(room.ownerId.toString());
            }

            const uniqueAdminIds = [...new Set(adminIdStrings)];
            const validUsersCount = await User.countDocuments({
                _id: { $in: uniqueAdminIds }
            });
            if (validUsersCount !== uniqueAdminIds.length) {
                return res.status(400).json({
                    message: "One or more admin user IDs do not exist in users"
                });
            }

            updates.adminIds = uniqueAdminIds;
        }

        // ===============================
        // Validate & Update dates
        // ===============================
        if (req.body.startDate !== undefined || req.body.endDate !== undefined) {
            const newStartDate = req.body.startDate !== undefined ? req.body.startDate : room.startDate;
            const newEndDate = req.body.endDate !== undefined ? req.body.endDate : room.endDate;

            const start = new Date(newStartDate);
            const end = new Date(newEndDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    message: "Invalid startDate or endDate format"
                });
            }

            if (end <= start) {
                return res.status(400).json({
                    message: "End date must be after start date"
                });
            }

            if (req.body.startDate !== undefined) updates.startDate = start;
            if (req.body.endDate !== undefined) updates.endDate = end;
        }

        // ===============================
        // Update database
        // ===============================
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        )
            .populate("categoryIds")
            .populate("ownerId", "name email")
            .populate("adminIds", "name email");

        res.status(200).json({
            message: "Room updated successfully",
            data: updatedRoom
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};



// ===============================
// Delete Room
// ===============================
const deleteRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        const userId = req.user.id || req.user._id;
        // Super Admin
        const isSuperAdmin = (req.user.role === "admin");
        // Room Owner
        const isOwner = (room.ownerId.toString() === userId.toString());

        // Only owner or super admin can delete a room
        if (!isSuperAdmin && !isOwner) {
            return res.status(403).json({
                message: "Only the room owner or a super admin can delete this room"
            });
        }

        // Before deleting the Room, delete related data:
        // 1. Messages & Chat
        const chat = await Chat.findOne({ roomId });
        if (chat) {
            await Message.deleteMany({
                chatId: chat._id
            });

            await Chat.deleteOne({
                _id: chat._id
            });
        }

        // 2. TaskCompletions
        await TaskCompletion.deleteMany({
            roomId
        });

        // 3. Tasks
        await Task.deleteMany({
            roomId
        });

        // 4. RoomMembers
        await RoomMember.deleteMany({
            roomId
        });

        // 5. Progress
        await Progress.deleteMany({
            roomId
        });

        // 6. Delete Room itself
        await Room.findByIdAndDelete(roomId);

        res.status(200).json({
            message: "Room deleted successfully",
            data: room
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom
};

