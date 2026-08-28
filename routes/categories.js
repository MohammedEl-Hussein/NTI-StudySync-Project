const express = require("express")
const router = express.Router()

const {
    createCategory,
    getAllCategories,
    updateCategoryById,
    deleteCategoryById
} = require("../controllers/categories")

router.post("/", createCategory);
router.get("/", getAllCategories);
router.patch("/:id", updateCategoryById);
router.delete("/:id", deleteCategoryById);

module.exports = router;