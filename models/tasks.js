const mongoose=require("mongoose")
const taskSchema= new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    }, // relationship room&tasks
    section: {type:String,required:true},// relationship ..&tasks
    title: {type:String,required:true},
    description: {type:String},
    order: {type:Number,required:true},
    dueDate: {type:Date},

},
  {
    timestamps:true // to update the date auto..
  });

taskSchema.index({ roomId: 1, section: 1, order: 1 });
//this task in that order in that section in that room

const taskModel = mongoose.model("Task",taskSchema)
module.exports = taskModel;