import accountController from '../components/account/accountController.js';
import express from 'express';

const router = express.Router();

router.use('/account',accountController);

export default router;