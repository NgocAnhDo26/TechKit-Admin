import accountController from '../components/account/accountController.js';
import categoryController from '../components/category/categoryController.js';
import profileController from '../components/user/userController.js';
import productController from '../components/product/productController.js';
import brandController from '../components/brand/brandController.js';
import reportController from '../components/report/reportController.js';
import orderController from '../components/order/orderController.js';
import express from 'express';

const router = express.Router();

router.use('/account', accountController);
router.use('/profile', profileController);
router.use('/category', categoryController);
router.use('/product', productController);
router.use('/brand', brandController);
router.use('/order', orderController);
router.use('/report', reportController);

export default router;
