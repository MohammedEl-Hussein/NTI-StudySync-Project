const express = require("express");
const auth = require("../auth/auth");

const {
    createProgress,
    getAllProgresses,
    getUserRoomProgress
} = require("../controllers/progresses");

const router = express.Router();

// Create progress when user joins a room
router.post("/", auth, createProgress);

// Get all progress of current user
router.get("/", auth, getAllProgresses);

// Get current user's progress in a specific room
router.get("/room/:roomId", auth, getUserRoomProgress);

module.exports = router;
