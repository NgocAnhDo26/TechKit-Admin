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

export default router;