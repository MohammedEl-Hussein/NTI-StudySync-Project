const express = require("express")
const router = express.Router()

const {
    createRoomMember,
    getAllRoomMembers,
    updateRoomMemberById,
    deleteRoomMemberById 
} = require("../controllers/roomMembers")


router.post("/createRoomMember",createRoomMember)
router.get("/getAllRoomMembers", getAllRoomMembers);
router.patch("/updateRoomMemberById/:id",updateRoomMemberById);
router.delete("/deleteRoomMemberById/:id", deleteRoomMemberById);