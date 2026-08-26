const express = require("express");

const router = express.Router();

const {
    createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom
} = require("../controllers/rooms");


router.post("/create", createRoom);
router.get("/rooms", getRooms);
router.get("/get/:id", getRoomById);
router.put("/update/:id", updateRoom);
router.delete("/delete/:id", deleteRoom);


module.exports = router;