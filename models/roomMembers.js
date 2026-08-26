const mongoose = require("mongoose")

const roomMembersSchema = new mongoose.Schema({
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
    joindAt: {
        type: Date,
        default: Date.now
    }
})

// Prevent the same user from joining the same room twice
roomMembersSchema.index({
    userId: 1, roomId: 1
},
{unique:true

})

const roomMemberModel = mongoose.model("RoomMember",roomMembersSchema);
module.exports = roomMemberModel