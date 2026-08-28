const express = require("express");
const auth = require("../auth/auth")
const router = express.Router();

const {
    createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom
} = require("../controllers/rooms");


router.post("/create", auth, createRoom);
router.get("/rooms", getRooms);
router.get("/get/:id", auth, getRoomById);
router.put("/update/:id", auth, updateRoom);
router.delete("/delete/:id", auth, deleteRoom);


module.exports = router;