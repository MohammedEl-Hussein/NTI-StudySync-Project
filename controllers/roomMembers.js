const roomMemberModel = require("../models/roomMembers");
const roomModel = require("../models/rooms");
const userModel = require("../models/users");


// const joinRoom = async (req, res) => {
//     try {
//         const { roomId } = req.params;
//         const userId = req.user._id;
//         // Check if room exists
//         const room = await roomModel.findById(roomId);
//         if (!room) {
//             return res.status(404).json({
//                 message: "Room not found"
//             });
//         }
//         // Check if user is already a member
//         const existingMember = await roomMemberModel.findOne({
//             userId,
//             roomId
//         });
//         if (existingMember) {
//             return res.status(400).json({
//                 message: "You are already a member of this room"
//             });
//         }
//         // Check room capacity
//         const membersCount = await roomMemberModel.countDocuments({
//             roomId
//         });
//         if (membersCount >= room.maxMembers) {
//             return res.status(400).json({
//                 message: "Room is full"
//             });
//         }
//         // Create membership
//         const roomMember = await roomMemberModel.create({
//             userId,
//             roomId
//         });
//         return res.status(201).json({
//             message: "Joined room successfully",
//             roomMember
//         });
//     } catch (err) {
//         return res.status(500).json({
//             message: err.message
//         });
//     }
// };
const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const userId = req.user.id;

        // Check if room exists
        const room = await roomModel.findById(roomId);

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        // Check if user is already a member
        const existingMember = await roomMemberModel.findOne({
            userId,
            roomId
        });

        if (existingMember) {
            return res.status(400).json({
                message: "You are already a member of this room"
            });
        }

        // Check room capacity
        const membersCount = await roomMemberModel.countDocuments({
            roomId
        });

        if (membersCount >= room.maxMembers) {
            return res.status(400).json({
                message: "Room is full"
            });
        }

        // Create membership
        const roomMember = await roomMemberModel.create({
            userId,
            roomId
        });

        return res.status(201).json({
            message: "Joined room successfully",
            roomMember
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
const getRoomMembers = async (req, res) => {
    try {
        const { roomId } = req.params;
        // Check if room exists
        const room = await roomModel.findById(roomId);
        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        // Get all members
        const members = await roomMemberModel
            .find({ roomId })
            .populate("userId", "name email studyLevel");
        return res.status(200).json({
            message: "Room members retrieved successfully",
            members
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
const leaveRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;
        // Check if user is the owner
        const room = await roomModel.findById(roomId);
        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        if (room.ownerId.toString() === userId.toString()) {
            return res.status(400).json({
                message: "Room owner cannot leave the room"
            });
        }
        // Find and delete membership
        const roomMember = await roomMemberModel.findOneAndDelete({
            userId,
            roomId
        });
        if (!roomMember) {
            return res.status(404).json({
                message: "You are not a member of this room"
            });
        }
        return res.status(200).json({
            message: "Left room successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
const addMember = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { userId } = req.body;
        const requesterId = req.user.id;
        // Check if userId was provided
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }
        // Check if room exists
        const room = await roomModel.findById(roomId);
        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        // Check if requester is owner
        const isOwner =
            room.ownerId.toString() === requesterId.toString();
        // Check if requester is room admin
        const isRoomAdmin = room.adminIds.some(
            adminId => adminId.toString() === requesterId.toString()
        );
        // Check if requester is super admin
        const isSuperAdmin = req.user.role === "admin";
        if (!isOwner && !isRoomAdmin && !isSuperAdmin) {
            return res.status(403).json({
                message: "You are not allowed to add members to this room"
            });
        }
        // Check if target user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        // Check if user is already a member
        const existingMember = await roomMemberModel.findOne({
            userId,
            roomId
        });
        if (existingMember) {
            return res.status(400).json({
                message: "User is already a member of this room"
            });
        }
        // Check room capacity
        const membersCount = await roomMemberModel.countDocuments({
            roomId
        });
        if (membersCount >= room.maxMembers) {
            return res.status(400).json({
                message: "Room is full"
            });
        }
        // Add member
        const roomMember = await roomMemberModel.create({
            userId,
            roomId
        });
        return res.status(201).json({
            message: "Member added successfully",
            roomMember
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
const removeMember = async (req, res) => {
    try {
        const { roomId, userId } = req.params;

        const requesterId = req.user.id;
        // Check if room exists
        const room = await roomModel.findById(roomId);
        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        // Owner?
        const isOwner =
            room.ownerId.toString() === requesterId.toString();
        // Room admin?
        const isRoomAdmin = room.adminIds.some(
            adminId => adminId.toString() === requesterId.toString()
        );
        // Super admin?
        const isSuperAdmin = req.user.role === "admin";
        if (!isOwner && !isRoomAdmin && !isSuperAdmin) {
            return res.status(403).json({
                message: "You are not allowed to remove members from this room"
            });
        }
        // Don't allow removing the owner
        if (room.ownerId.toString() === userId.toString()) {
            return res.status(400).json({
                message: "Room owner cannot be removed"
            });
        }
        // Find membership
        const roomMember = await roomMemberModel.findOneAndDelete({
            userId,
            roomId
        });
        if (!roomMember) {
            return res.status(404).json({
                message: "User is not a member of this room"
            });
        }
        return res.status(200).json({
            message: "Member removed successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};


module.exports = {
    joinRoom,
    getRoomMembers,
    leaveRoom,
    addMember,
    removeMember
};