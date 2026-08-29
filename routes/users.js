const express = require("express");
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    login
} = require("../controllers/users");
const router = express.Router()
 
router.post("/create",createUser)
router.get("/getUser", getAllUsers);
router.get("/getUsers/:id", getUserById);
router.put("/updateUser/:id", updateUserById);
router.delete("/deleteUser/:id", deleteUserById);
router.post("/login",login)
module.exports=router
