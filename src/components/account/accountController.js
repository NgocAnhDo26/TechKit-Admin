import express from 'express';
import * as accountService from './accountService.js';
import { errorResponse } from '../util/util.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await accountService.fetchAccountsByQuery(req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
  }
});

router.get('/:account_id', async (req, res) => {
  try {
    const {account_id} = req.params;
    const result = await accountService.fetchAccountByID(account_id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
  }
});

export async function renderAccountPage(req, res) {
  try {
    const result = await accountService.fetchAccountsByQuery(req.query);
    // console.log(result);
    res.status(200).render('index', { section: 'account', accounts: result });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
  }
}

// POST /ban - Toggle ban status of an account
router.post('/ban', async (req, res) => {
  try {
    const { account_id } = req.body;
    // console.log(account_id);
    if (!account_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID của tài khoản',
      });
    }

    if (Number(account_id) === Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Không thể thay đổi khóa của chính mình',
      });
    }

    // Use the toggleBanAccountByID service to toggle the account ban status
    const result = await accountService.toggleBanAccountByID(account_id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error toggling account ban status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;
