const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    section: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    description: {
      type: String,
      trim: true
    },

    // order of the task inside the room
    //not inside the section
    order: {
      type: Number,
      required: true,
      min: 1
    },

    dueDate: {
      type: Date
    }
  }, {timestamps: true}
);


// each task must have a unique order inside its room
taskSchema.index({roomId: 1,order: 1},{unique: true});

//can not write same title in the same section of the room
taskSchema.index({roomId: 1,section: 1,title: 1},{unique: true});

const taskModel = mongoose.model("Task", taskSchema);

module.exports = taskModel;