const express = require("express");

const {
    createProgress,
    getAllProgresses,
    getUserRoomProgress
} = require("../controllers/progresses");

const router = express.Router();

// Create progress when user joins a room
router.post("/", createProgress);

// Get all progress of current user
router.get("/", getAllProgresses);

// Get current user's progress in a specific room
router.get("/room/:roomId",getUserRoomProgress);

module.exports = router;
