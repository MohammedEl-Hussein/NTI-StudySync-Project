const express = require("express");

const {
    completeTask,
    unCompletedTask,
    getCompletedTask,
    getCompletedTasksByUser
} = require("../controllers/taskCompletion");

const router = express.Router();
router.post("/complete", completeTask);
router.delete("/uncomplete", unCompletedTask);
router.get("/allcompleted", getCompletedTask);
router.get("/completed", getCompletedTasksByUser);

module.exports = router;