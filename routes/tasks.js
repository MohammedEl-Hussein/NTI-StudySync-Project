const express=require("express")
const {
    createTask,
    updateTask,
    deleteTask,
    getAllTasks,
    getTasksByTitle,
    getTasksById
} = require("../controllers/tasks");

const router = express.Router();

router.post("/createtask",createTask)
router.put("/updatetask",updateTask)
router.delete("/deletetask",deleteTask)
router.get("/getalltask",getAllTasks)
router.get("/gettaskbytitle",getTasksByTitle)
router.get("/gettaskbyid",getTasksById)

module.exports=router
