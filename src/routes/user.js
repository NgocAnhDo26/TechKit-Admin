import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { section: 'account' });
});

router.get('/account', (req, res) => {
    res.render('index', { section: 'account' });
});

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