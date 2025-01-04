import express from 'express';
import apiRoute from './api.js';
import userRoute from './user.js';
import { authorize } from '../components/auth/authService.js';
import { errorResponse } from '../components/util/util.js';

const router = express.Router();

// Use this route for RESTful API (AJAX)
router.use(`/api`, apiRoute);

// Use this route for all SSR
router.use('', userRoute);

// Handle 404 - Not Found for API routes
router.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Handle 404 - Not Found for all other routes
router.use('*', (req, res) => {
  res.status(404).send(errorResponse(404, 'Trang không tồn tại'));
});

export default router;
