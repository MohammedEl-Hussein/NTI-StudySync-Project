const userModel = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// crud operation
const createUser = async (req, res) => {
  try {
    const newUser = req.body;
    const user = await userModel.create(newUser);
    res.status(201).json({ message: "user created", data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "invalid email or password" });
    }
    const isVaild = await bcrypt.compare(password, user.password);
    if (!isVaild) {
      return res.status(404).json({ message: "invalid email or password" });
    }
    // genete token
    const token = jwt.sign(
      { id: user._id.toString,uname: user.userName, email: user.email ,role:user.role},
      "this is my secret key",
      { expiresIn: "1d" },
    );

    res.status(200).json({ message: "login success", data: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllUsers = async(req,res)=>{
    try{
        const users = await userModel.find();
        res.status(200).json({
            message: "users retrieved",
            data:users
        });
    } catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}
const getUserById = async(req,res)=>{
        try{
        const users = await userModel.findById(req.params.id);
            res.status(200).json({
            message: "users retrieved",
            data:users
        });
    } catch(err){
        res.status(500).json({
            message: err.message
        })
    }
};
const updateUserById = async(req,res)=>{
    try{
            const user = await userModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if(!user){
            return res.status(404).json({
                message: "user not found"
            });  
        }
        res.status(200).json({
            message: "user updated",
            data: user
        });      
    }catch(err){
        res.status(500).json({
            message: err.message
        })        
    }
};
const deleteUserById = async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.id);
 
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            });
        }
 
        res.status(200).json({
            message: "user deleted",
            data: user
        });
 
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
 

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  login,
};