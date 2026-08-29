const categoryModel = require("../models/categories")

const createCategory = async (req, res) => {
    try {
        const {
            name,
            description
        } = req.body;

        // Validate name
        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const categoryName = name.trim().toLowerCase();

        // Check if category already exists
        const existCategory = await categoryModel.findOne({
            name: categoryName
        });

        if (existCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        // Create category
        const category = await categoryModel.create({
            name: categoryName,
            description: description?.trim()
        });

        return res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find();

        return res.status(200).json({
            message: "Categories retrieved successfully",
            categories
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
const updateCategoryById = async (req, res) => {
    try {
        // Only super admin can update categories
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only super admin can update categories"
            });
        }

        const { id } = req.params;
        const { name, description } = req.body;

        const category = await categoryModel.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        if (name) {
            const categoryName = name.trim().toLowerCase();

            const existCategory = await categoryModel.findOne({
                name: categoryName,
                _id: { $ne: id }
            });

            if (existCategory) {
                return res.status(400).json({
                    message: "Category already exists"
                });
            }

            category.name = categoryName;
        }

        if (description !== undefined) {
            category.description = description?.trim();
        }

        await category.save();

        return res.status(200).json({
            message: "Category updated successfully",
            category
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
const deleteCategoryById = async (req, res) => {
    try {
        // Only super admin can delete categories
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only super admin can delete categories"
            });
        }

        const { id } = req.params;

        const category = await categoryModel.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        return res.status(200).json({
            message: "Category deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
module.exports = {
    createCategory,
    getAllCategories,
    updateCategoryById,
    deleteCategoryById
}