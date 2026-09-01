const express = require("express");
const router = express.Router();
const auth = require("../auth/auth");
const {
  createTask,
  updateTask,
  reorderTask,
  deleteTask,
  getAllTasks,
  getTasksBySection,
  getTasksByTitle,
  getTaskById
} = require("../controllers/tasks");

// admin , owner only
router.post("/createtask", auth, createTask);
router.put("/updatetask/:id", auth, updateTask);
router.put("/reordertask/:id", auth, reorderTask);
router.delete("/deletetask/:id", auth, deleteTask);

//admin , owner and users
router.get("/getalltasks/:roomId", getAllTasks);
router.get("/getalltask/:roomId", getAllTasks);
router.get("/gettaskbysection/:roomId/:section",getTasksBySection);
router.get("/gettaskbytitle/:roomId/:title",getTasksByTitle);
router.get("/gettaskbyid/:id",getTaskById);

module.exports = router;