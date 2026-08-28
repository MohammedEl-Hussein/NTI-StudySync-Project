const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100

  },
  age: {
    type: Number,
    min: 13,
    max: 100
  },
  studyLevel:{
    type: String,
    trim: true
  },
  organization:{
    type: String,
    trim: true
  },
  department:{
    type: String,
    trim: true
  },
  gender:{
    type: String,
    enum: ["Male", "Female"]
  },
  phone:{
    type: String,
    trim: true
  },
  email:{
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password:{
    type: String,
    required: true,
    minlength: 6
  },
  role:{
    type: String,
    enum: ["user", "admin"],
    default: "user"
    }
  },
  {

    timestamps: true

  }
);


userSchema.pre("save", async function () {
  let salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

const userModel = mongoose.model("User", userSchema);    
module.exports = userModel;
