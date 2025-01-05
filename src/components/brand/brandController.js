import express from 'express';
import * as brandService from './brandService.js';

const router = express.Router();

// GET /brand - Fetch all brands
router.get('/', async (req, res) => {
    try {
        const brands = await brandService.fetchAllBrands();
        res.status(200).json({
            success: true,
            message: 'Brands fetched successfully',
            result: brands,
        });
    } catch (error) {
        console.error('Error in GET /brand:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch brands',
        });
    }
});

export async function renderBrandPage(req, res) {
    try {
        const brands = await brandService.fetchAllBrands();
        res.status(200).render('index', { section: 'brand', brands });
    } catch (error) {
        console.error('Error in GET /brand:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch brands',
        });
    }
}

// POST /brand - Add a new brand
router.post('/', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Brand name is required',
        });
    }

    try {
        const newBrand = await brandService.addBrand(name);
        res.status(201).json({
            success: true,
            message: 'Brand added successfully',
            brand: newBrand,
        });
    } catch (error) {
        console.error('Error in POST /brand:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add brand',
        });
    }
});

// POST /brand/:brand_id - Edit a brand
router.post('/:brand_id', async (req, res) => {
    const { name } = req.body; 
    const { brand_id } = req.params; 

    try {
        // Call the editBrand service to update the brand
        const updatedBrand = await brandService.editBrand(Number(brand_id), name);

        // Return the updated brand in the response
        return res.status(200).json({
            success: true,
            message: 'Brand updated successfully',
            brand: updatedBrand,
        });
    } catch (error) {
        console.error('Error updating brand:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to update brand' });
    }
});

// DELETE /brand/:id - Delete a brand by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Brand ID is required',
        });
    }
    try {
        // Assuming brandService.deleteBrand handles deletion
        const result = await brandService.deleteBrand(Number(id));
        if (result) {
            return res.status(200).json({
                success: true,
                message: 'Brand deleted successfully',
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Brand not found',
            });
        }
    } catch (error) {
        console.error('Error in DELETE /brand:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete brand',
        });
    }
});

export default router;