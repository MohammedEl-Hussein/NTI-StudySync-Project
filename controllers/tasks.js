const taskModel=require("../models/tasks")

const createTask=async(req,res) =>{
    try {
        const { roomId, section, title, order } = req.body;
        if (!roomId || !section || !title || !order) 
            return res.status(400).json({ message: "All fields are required" });

        const checkTask = await taskModel.findOne({roomId, section, title, order})
        if(checkTask)
            return res.status(400).json({ message: "This task is already exists" });

        const user = await taskModel.create({ roomId, section, title, order });
        return res.status(201).json({})
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports={
    createTask,
}
// task completed:

// const createTaskCompletion = async (req, res) => {
//     try {
//         const { userId, roomId, taskId } = req.body;

//         // Check if this user already completed this task
//         const existingCompletion = await taskCompletionModel.findOne({//check if this task is existed or not 
//             userId,
//             taskId
//         });

//         if (existingCompletion) {
//             return res.status(400).json({
//                 message: "Task already completed"
//             });
//         }
                
//         const taskCompletion = await taskCompletionModel.create({//create one
//             userId,
//             roomId,
//             taskId
//         });

//         res.status(201).json({
//             message: "Task completed successfully",
//             data: taskCompletion
//         });

//     } catch (err) {
//         res.status(500).json({
//             message: "Error completing task",
//             error: err.message
//         });
//     }
// };