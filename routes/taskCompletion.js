const express = require("express");

const auth = require("../auth/auth");

const {
  completeTask,
  unCompletedTask,
  getCompletedTask,
  getCompletedTasksByUser
} = require("../controllers/taskCompletion");

const router = express.Router();


// Complete task
router.post("/complete", auth, completeTask);


// Uncomplete task
router.delete("/uncomplete", auth, unCompletedTask);


// Get one completed task
router.get("/allcompleted", auth, getCompletedTask);


// Get all completed tasks for a specific user
router.get(
  "/completed/:userId",
  auth,
  getCompletedTasksByUser
);


module.exports = router;
