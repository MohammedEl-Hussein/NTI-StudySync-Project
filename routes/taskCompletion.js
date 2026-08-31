const express = require("express");

const auth = require("../auth/auth");

const {
    completeTask,
    unCompletedTask,
    getCompletedTasksByUser
} = require("../controllers/taskCompletion");

const router = express.Router();

router.post("/complete", auth, completeTask);

router.delete("/uncomplete", auth, unCompletedTask);
router.get("/allcompleted", auth, getCompletedTasksByUser);

module.exports = router;