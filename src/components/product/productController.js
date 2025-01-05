import express from 'express';
import * as productService from './productService.js';
import { upload } from '../../config/config.js';
import { errorResponse } from '../util/util.js';

const router = express.Router();

// Add new product
router.post('/', upload.array('images'), async (req, res) => {
  productService
    .createProduct(req.body, req.files)
    .then((product) => {
      res.json(product);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
    });
});

// Get all categories and brands
router.get('/categories-brands', async (req, res) => {
  productService
    .getCategoriesAndBrands()
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
    });
});

export default router;
