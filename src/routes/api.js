import accountController from '../components/account/accountController.js';
import categoryController from '../components/category/categoryController.js';
import express from 'express';

const router = express.Router();

router.use('/account',accountController);
router.use('/category',categoryController);

export default router;