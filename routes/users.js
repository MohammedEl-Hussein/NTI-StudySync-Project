const express = require("express");
const router = express.Router()
const auth = require("../auth/auth");

const {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    login
} = require("../controllers/users");

 
router.post("/",createUser)
router.get("/", auth, getAllUsers);
router.get("/:id", auth, getUserById);
router.put("/:id", auth, updateUserById);
router.delete("/:id", auth, deleteUserById);
router.post("/login",login)
module.exports=router
