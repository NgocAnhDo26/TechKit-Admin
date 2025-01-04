import express from 'express';
import apiRoute from './api.js';
import userRoute from './user.js';

const router = express.Router();

// Use this route for RESTful API (AJAX)
router.use(`/api`, apiRoute);

// Use this route for all SSR
router.use('', userRoute);

// Handle 404 - Not Found
router.use((req, res, next) => {
  res.status(404).render('index', {
    section: 'error',
    message: 'Xin lỗi, trang bạn yêu cầu không tồn tại',
    status: 404,
  });
});
export default router;
