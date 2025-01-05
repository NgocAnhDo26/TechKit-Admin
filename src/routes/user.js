import express from 'express';
import { renderCategoryPage } from '../components/category/categoryController.js';
import { renderBrandPage } from '../components/brand/brandController.js';
import { renderAccountPage } from '../components/account/accountController.js';
import authController from '../components/auth/authController.js';
import { forbidRoute } from '../components/auth/authService.js';
import { fetchProductWithQuery } from '../components/product/productService.js';
import { fetchAllCategories } from '../components/category/categoryService.js';
import { fetchAllBrands } from '../components/brand/brandService.js';

const router = express.Router();

router.get('/', renderAccountPage);

router.get('/account', renderAccountPage);

router.use('/category', renderCategoryPage);

router.use('/brand', renderBrandPage);

router.get('/product', async (req, res) => {
  const data = await fetchProductWithQuery(req.query);
  const categories = await fetchAllCategories();
  const brands = await fetchAllBrands();
  res.render('index', { section: 'product', data, categories, brands });
});

router.get('/order', (req, res) => {
  res.render('index', { section: 'order' });
});

router.get('/report', (req, res) => {
  res.render('index', { section: 'report' });
});

router.use('/auth', forbidRoute, authController);

export default router;
