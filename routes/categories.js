const express = require("express")
const router = express.Router()

const {
    createCategory,
    getAllCategories,
    updateCategoryById,
    deleteCategoryById
} = require("../controllers/categories")

router.post("/createCategory",createCategory)
router.get("/getAllCategories", getAllCategories);
router.patch("/updateCategoryById/:id", updateCategoryById);
router.delete("/deleteCategoryById/:id", deleteCategoryById);