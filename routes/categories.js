const express = require("express");
const router = express.Router();

const auth = require("../auth/auth");

const {
    createCategory,
    getAllCategories,
    updateCategoryById,
    deleteCategoryById
} = require("../controllers/categories");

router.post("/", auth, createCategory);
router.get("/", auth, getAllCategories);
router.patch("/:id", auth, updateCategoryById);
router.delete("/:id", auth, deleteCategoryById);

module.exports = router;