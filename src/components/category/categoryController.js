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
        res.status(200).render('index', {section: 'category', categories});
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
            category: newCategory,
        });
    } catch (error) {
        console.error('Error in POST /category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add category',
        });
    }
});

// POST /category/:category_id - Edit a category
router.post('/:category_id', async (req, res) => {
    const { name } = req.body;  // Extract the new name from the request body
    const { category_id } = req.params;  // Extract the category ID from the URL parameters
  
    try {
      // Call the editCategory service to update the category
      const updatedCategory = await categoryService.editCategory(Number(category_id), name);
  
      // Return the updated category in the response
      return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        category: updatedCategory,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({ success: false,message: error.message || 'Failed to update category' });
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
    console.log(id);
    try {
        // Assuming categoryService.deleteCategory handles deletion
        const result = await categoryService.deleteCategory(Number(id));
        if (result) {
            return res.status(200).json({
                success: true,
                message: 'Category deleted successfully',
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }
    } catch (error) {
        console.error('Error in DELETE /category:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete category',
        });
    }
});


export default router;
