import express from 'express';
import { renderCategoryPage } from '../components/category/categoryController.js';
import { renderBrandPage } from '../components/brand/brandController.js';
import { renderProfilePage } from '../components/user/userController.js';
import { renderAccountPage } from '../components/account/accountController.js';
import authController from '../components/auth/authController.js';
import { forbidRoute } from '../components/auth/authService.js';
import { fetchProductWithQuery } from '../components/product/productService.js';
import { fetchAllCategories } from '../components/category/categoryService.js';
import { fetchAllBrands } from '../components/brand/brandService.js';
import { authorize } from '../components/auth/authService.js';

const router = express.Router();

router.get('/', (req, res) => {
  if (req.user) {
    return res.redirect('/account');
  }
  res.render('login');
});

router.get('/profile', authorize, renderProfilePage);

router.get('/account', authorize, renderAccountPage);

router.get('/category', authorize, renderCategoryPage);

router.get('/brand', authorize, renderBrandPage);

router.get('/product', authorize, async (req, res) => {
  const data = await fetchProductWithQuery(req.query);
  const categories = await fetchAllCategories();
  const brands = await fetchAllBrands();
  res.render('index', { section: 'product', data, categories, brands });
});

router.get('/order', authorize, (req, res) => {
  res.render('index', { section: 'order' });
});

router.get('/report', authorize, (req, res) => {
  res.render('index', { section: 'report' });
});

router.use('/auth', forbidRoute, authController);

export default router;
