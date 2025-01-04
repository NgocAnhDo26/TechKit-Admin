import accountController from '../components/account/accountController.js';
import categoryController from '../components/category/categoryController.js';
import productController from '../components/product/productController.js';
import brandController from '../components/brand/brandController.js';
import express from 'express';

const router = express.Router();

router.use('/account', accountController);
router.use('/category', categoryController);
router.use('/product', productController);
router.use('/brand', brandController);

export default router;
