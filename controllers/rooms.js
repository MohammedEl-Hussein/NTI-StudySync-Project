const Room = require("../models/rooms");


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
            meetingURL,
            ownerId
        } = req.body;

        // Check required fields
        if (
            !title ||
            !categoryIds ||
            !level ||
            !maxMembers ||
            !startDate ||
            !endDate
        ) {
            return res.status(400).json({
                message: "Please provide all required room data"
            });
        }

        // Check dates
        if (new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({
                message: "End date must be after start date"
            });
        }

        // The logged-in user becomes the owner
        // const ownerId = req.user.id;

        const room = await Room.create({
            title,
            categoryIds,
            level,
            description,
            maxMembers,
            startDate,
            endDate,
            meetingURL,
            ownerId,
            // The owner is also initially a room admin
            adminIds: [ownerId]
        })

        res.status(201).json({
            message: "Room created successfully",
            data: room
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};



// ===============================
// Get All Rooms
// ===============================
const getRooms = async (req, res) => {
    try {
        // to show the data of the refrenced collections not only the id
        const rooms = await Room.find()
            .populate("categoryIds")
            .populate("ownerId", "name email")
            .populate("adminIds", "name email")

        res.status(200).json({
            message: "Rooms retrieved successfully",
            data: rooms
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}


// ===============================
// Get Room By ID
// ===============================
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate("categoryIds")
            .populate("ownerId", "name email")
            .populate("adminIds", "name email")

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            })
        }

        res.status(200).json({
            message: "Room retrieved successfully",
            data: room
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}



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

        const userId = req.user.id;

        // ===============================
        // Check user permissions
        // ===============================

        const isSuperAdmin =req.user.role === "admin";
        const isOwner =room.ownerId.toString() === userId;
        const isRoomAdmin =
            room.adminIds.some(
                adminId => adminId.toString() === userId
            );

        // Normal users cannot update the room
        if (!isSuperAdmin && !isOwner && !isRoomAdmin) {
            return res.status(403).json({
                message: "You are not allowed to update this room"
            });
        }

        // ===============================
        // Allowed normal fields
        // ===============================

        const allowedFields = [
            "title",
            "categoryIds",
            "level",
            "description",
            "maxMembers",
            "startDate",
            "endDate",
            "meetingURL"
        ];

        const updates = {};

        // Only add fields that were actually sent
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        // ===============================
        // adminIds
        // ===============================

        // Only Owner or Super Admin can add/remove room admins

        if (req.body.adminIds !== undefined) {
            if (!isOwner && !isSuperAdmin) {
                return res.status(403).json({
                    message: "Only the room owner or a super admin can manage room admins"
                });
            }
            updates.adminIds = req.body.adminIds;
        }

        // ===============================
        // Prevent ownerId modification
        // ===============================

        if (req.body.ownerId !== undefined) {
            return res.status(403).json({
                message:"Room ownership cannot be changed through this operation"
            });
        }

        // ===============================
        // Validate dates
        // ===============================
        const newStartDate = updates.startDate || room.startDate;
        const newEndDate = updates.endDate || room.endDate;

        if (new Date(newEndDate) <= new Date(newStartDate)) {
            return res.status(400).json({
                message:
                    "End date must be after start date"
            });
        }

        // ===============================
        // Update database
        // ===============================

        const updatedRoom =
            await Room.findByIdAndUpdate(
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
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        const userId = req.user.id;
        // Super Admin
        const isSuperAdmin = (req.user.role === "admin");
        // Room Owner
        const isOwner = (room.ownerId.toString() === userId);

        // only owner or super admin can delete a room
        if (!isSuperAdmin && !isOwner) {
            return res.status(403).json({
                message:
                    "Only the room owner or a super admin can delete this room"
            });
        }

        await Room.findByIdAndDelete(req.params.id);

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