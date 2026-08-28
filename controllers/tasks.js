const taskModel=require("../models/tasks")
const taskCompletionModel = require("../models/taskCompletion"); // for delete function

const createTask=async(req,res) =>{
    try {
        const { roomId, section, title ,description, dueDate} = req.body;
        if (!roomId || !section || !title ) 
            return res.status(400).json({ message: "All fields are required" });

        const checkTask = await taskModel.findOne({roomId, section, title})
        if(checkTask)
            return res.status(400).json({ message: "This task is already exists" });

        let newOrder
        const lastOrder = await taskModel.findOne({roomId, section}).sort({order:-1})
        if(lastOrder)
            newOrder = lastOrder.order + 1;
        else
            newOrder = 1;

        const createdTask = await taskModel.create({ roomId, section, title, order: newOrder, description, dueDate });
        return res.status(201).json({message: "Task created successfully", data: createdTask})
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


// we can't update the roomId
const updateTask=async(req,res) =>{
    try {
        const checkTask = await taskModel.findById({_id:req.params.id})
        if(!checkTask)
            return res.status(404).json({ message: "This task is not found" });

        if(checkTask)
        {
            const {title, order, section, description, dueDate } = req.body;
            const updatedTask = await taskModel.findByIdAndUpdate(
                req.params.id,{title, order, section, description, dueDate },{
                    new: true, // return the updated document
                    runValidators: true // check the validation rules defined in the schema
                }
            )

            return res.status(200).json({message: "Task updated successfully",data: updatedTask});
        
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const deleteTask=async(req,res)=>{
    try{
        const checkTask = await taskModel.findById({_id:req.params.id})
        if(!checkTask)
            return res.status(404).json({ message: "This task is not found" });

        const deletedTask=await taskModel.deleteOne({_id:req.params.id});
        res.status(200).json({message:"Task deleted successfully",data:deletedTask})
        
    } catch(err){
        res.status(500).json({message:err.message})
    }
};


// get all tasks in that room
// logic error if it gets all tasks in the project

const getAllTasks=async(req,res)=>{ 
    try {
        const { roomId } = req.params;
        const foundTasks = await taskModel.find({roomId}).sort({section: 1, order: 1});
        res.status(200).json({message:"All tasks retrieved successfully",data:foundTasks})
    } catch(err){
        res.status(500).json({message:err.message})
    }
}
const getTasksByTitle=async(req,res)=>{ 
    try {
        const { roomId, title } = req.params;
        const foundTasks = await taskModel.find({roomId,title}).sort({section: 1, order: 1});
        
        if(foundTasks.length === 0) // DB didn't receive the title
            return res.status(404).json({message:"No tasks found with the given title in this room"});
        
        res.status(200).json({message:"Tasks fetched successfully",data:foundTasks})

    } catch(err){
        res.status(500).json({message:err.message})
    }
}
const getTasksById=async(req,res)=>{ 
    try {

        const foundTasks = await taskModel.findById(req.params.id);
        if(!foundTasks)
            return res.status(404).json({message:"No tasks found with the given id"});
        
        res.status(200).json({message:"Tasks fetched successfully",data:foundTasks})

    } catch(err){
        res.status(500).json({message:err.message})
    }
}

module.exports={
    createTask,
    updateTask,
    deleteTask,
    getAllTasks,
    getTasksByTitle,
    getTasksById
}