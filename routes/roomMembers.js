const express = require("express");
const router = express.Router();
const auth = require("../auth/auth");

const {
    joinRoom,
    getRoomMembers,
    leaveRoom,
    addMember,
    removeMember
} = require("../controllers/roomMembers");


router.post("/:roomId/join",auth ,joinRoom);
router.get("/:roomId/members",auth ,getRoomMembers);
router.delete("/:roomId/leave",auth, leaveRoom);
router.post("/:roomId/members",auth, addMember);
router.delete("/:roomId/members/:userId",auth, removeMember);


module.exports = router;