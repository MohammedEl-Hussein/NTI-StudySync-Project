const mongoose=require("mongoose")
const taskCompletionSchema= new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, 
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    }, // relationship room&tasks
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    }, 
    completedAt: {// that date when we call it
      type: Date,
      default: Date.now
    },
timestamps:true // to update the date auto..

});


// make one user has one of this task & can't complete it twice
// if a user completed this task, the other user can complete it too
// make sure every user has own task completion for this task

taskCompletionSchema.index( 
  { userId: 1, taskId: 1 }, 
  { unique: true }
);

taskCompletionSchema.index({userId: 1});//to find or know what tasks is completed by that user
taskCompletionSchema.index({roomId: 1});// to know the rooms has this task or completed
taskCompletionSchema.index({taskId: 1});//who finished this task /how many users completed this task

const taskCompletionModel = mongoose.model("TaskCompletion",taskCompletionSchema)
module.exports = taskCompletionModel;