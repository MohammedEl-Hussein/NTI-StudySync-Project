const categoryModel = require("../models/categories")

const createCategory = async (req,res) => {
    try{
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
        const existCategory = await categoryModel.findOne({
            name: categoryName
        });

        // Check if category already exists        
        if(existCategory){
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        const category = await categoryModel.create({
            name: categoryName,
            description: description?.trim()
        })
        res.status(201).json({
            message: "Category created successfully",
            category
        })
    } catch(err){
        res.status(500).json({
            message: err.message
        })
    }
};
const getAllCategories = async (req,res) => {
};
const updateCategoryById = async (req,res) => {
};
const deleteCategoryById = async (req,res) => {
};  

module.exports = {
    createCategory,
    getAllCategories,
    updateCategoryById,
    deleteCategoryById
}