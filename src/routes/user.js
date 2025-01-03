import express from 'express';
import * as accountService from '../components/account/accountService.js';
import categoryController from '../components/category/categoryController.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await accountService.fetchAccountsByQuery(req.query);
        res.render('index', { section: 'account', accounts: result });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/account',async (req, res) => {
    try {
        const result = await accountService.fetchAccountsByQuery(req.query);
        res.render('index', { section: 'account', accounts: result });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.use('/category',categoryController);

router.get('/product', (req, res) => {
    res.render('index', { section: 'product' });
});

router.get('/order', (req, res) => {
    res.render('index', { section: 'order' });
});

router.get('/report', (req, res) => {
    res.render('index', { section: 'report' });
});

export default router;