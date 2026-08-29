const express = require("express");
const auth = require("../auth/auth");

const {
  createProgress,
  getAllProgresses,
  getUserRoomProgress,
  updateProgress,
  deleteProgress
} = require("../controllers/progresses");

const router = express.Router();

router.post("/", auth, createProgress);

router.get("/", auth, getAllProgresses);

router.get("/room/:roomId", auth, getUserRoomProgress);

router.put("/:id", auth, updateProgress);

router.delete("/:id", auth, deleteProgress);

module.exports = router;