import express from 'express';
import * as categoryService from './categoryService.js';

const router = express.Router();

// GET /category - Fetch all categories
router.get('/', async (req, res) => {
    try {
        const categories = await categoryService.fetchAllCategories();
        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            result: categories,
        });
    } catch (error) {
        console.error('Error in GET /category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch categories',
        });
    }
});

export async function renderCategoryPage(req, res) {
    try {
        const categories = await categoryService.fetchAllCategories();
        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            result: categories,
        });
    } catch (error) {
        console.error('Error in GET /category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch categories',
        });
    }
}

// POST /category - Add a new category
router.post('/', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Category name is required',
        });
    }

    try {
        const newCategory = await categoryService.addCategory(name);
        res.status(201).json({
            success: true,
            message: 'Category added successfully',
            result: newCategory,
        });
    } catch (error) {
        console.error('Error in POST /category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add category',
        });
    }
});

// DELETE /category/:id - Delete a category by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Category ID is required',
        });
    }

    try {
        const result = await categoryService.deleteCategory(parseInt(id));
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in DELETE /category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete category',
        });
    }
});

export default router;
