import express from 'express';
import * as accountService from './accountService.js';

const router = express.Router();

router.get('/', async (req,res) => {
    try {
        const result = await accountService.fetchAccountsByQuery(req.query);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).send('Internal Server Error');
    }
})

export async function renderAccountPage(req, res) {
    try {
        const result = await accountService.fetchAccountsByQuery(req.query);
        res.status(200).render('index', { section: 'account', accounts: result });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).send('Internal Server Error');
    }
}

// POST /ban - Ban an account
router.post('/ban', async (req, res) => {
    try {
        const { account_id } = req.body;

        if (!account_id) {
            return res.status(400).json({
                success: false,
                message: 'Account ID is required',
            });
        }

        // Prevent banning the currently logged-in user
        if (account_id === req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You cannot ban your own account",
            });
        }

        const result = await banAccountByID(account_id);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error banning account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// POST /unban - Unban an account
router.post('/unban', async (req, res) => {
    try {
        const { account_id } = req.body;

        if (!account_id) {
            return res.status(400).json({
                success: false,
                message: 'Account ID is required',
            });
        }

        const result = await unbanAccountByID(account_id);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error unbanning account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

export default router;