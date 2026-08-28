const express = require("express");
const router = express.Router();

const {
    joinRoom,
    getRoomMembers,
    leaveRoom,
    addMember,
    removeMember
} = require("../controllers/roomMembers");


router.post("/:roomId/join", joinRoom);
router.get("/:roomId/members", getRoomMembers);
router.delete("/:roomId/leave", leaveRoom);
router.post("/:roomId/members", addMember);
router.delete("/:roomId/members/:userId", removeMember);


module.exports = router;