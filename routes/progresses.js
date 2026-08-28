const express = require("express");

const {
  createProgress,
  getAllProgresses,
  getUserRoomProgress,
  updateProgress,
  deleteProgress
} = require("../controllers/progresses");

const router = express.Router();

router.post("/", createProgress);

router.get("/", getAllProgresses);

router.get(
  "/user/:userId/room/:roomId",
  getUserRoomProgress
);

router.put("/:id", updateProgress);

router.delete("/:id", deleteProgress);

module.exports = router;