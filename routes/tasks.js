const express = require("express");

const auth = require("../auth/auth");

const {
  createTask,
  updateTask,
  deleteTask,
  getAllTasks,
  getTasksBySection,
  getTasksByTitle,
  getTaskById

} = require("../controllers/tasks");

const router = express.Router();

router.post("/createtask", auth, createTask);

router.put("/updatetask/:id", auth, updateTask);

router.delete("/deletetask/:id", auth, deleteTask);

router.get("/getalltask/:roomId", auth, getAllTasks);

router.get(
  "/gettasksbysection/:roomId/:section",
  auth,
  getTasksBySection
);

router.get(
  "/gettaskbytitle/:roomId/:title",
  auth,
  getTasksByTitle
);

router.get(
  "/gettaskbyid/:id",
  auth,
  getTaskById
);

module.exports = router;