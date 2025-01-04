import express from 'express';
import { renderCategoryPage } from '../components/category/categoryController.js';
import { renderAccountPage } from '../components/account/accountController.js';
import authController from '../components/auth/authController.js';

const router = express.Router();

router.get('/', renderAccountPage);

router.get('/account', renderAccountPage);

router.use('/category', renderCategoryPage);

router.get('/product', (req, res) => {
  res.render('index', { section: 'product' });
});

router.get('/order', (req, res) => {
  res.render('index', { section: 'order' });
});

router.get('/report', (req, res) => {
  res.render('index', { section: 'report' });
});

router.use('/auth', authController);

export default router;
