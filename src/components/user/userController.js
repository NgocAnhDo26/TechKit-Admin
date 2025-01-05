import express from 'express';
import * as service from './userService.js';
import { getUrl } from '../util/util.js';
import { upload } from '../../config/config.js';
const router = express.Router();

// Function to fetch account details by ID
async function fetchAccountDetails(req, res) {
  const account_id = req.user.id;

  if (!account_id) {
    return res.status(400).json({
      success: false,
      message: 'Account ID is required',
    });
  }

  try {
    const account = await service.fetchAccountByID(account_id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }
    account.avatar_url = getUrl(account.avatar);
    res.status(200).json({
      success: true,
      message: 'Account fetched successfully',
      result: account,
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch account',
    });
  }
}

// GET / - Fetch account details by ID
router.get('/', fetchAccountDetails);

// Renders the profile page with account details
export async function renderProfilePage(req, res) {
  try {
    const account = await service.fetchAccountByID(req.user.id);
    if (!account) {
      return res.status(404).send('Account not found');
    }
    account.avatar_url = getUrl(account.avatar);
    res.status(200).render('index', { section: 'profile', account });
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).send('Error occured when fetching account');
  }
}

async function updateProfile(req, res) {
  const { name, address, birthdate, sex, phone } = req.body;
  const account_id = req.user.id;

  if (!account_id) {
    return res.status(400).json({
      success: false,
      message: 'Account ID is required',
    });
  }

  const account = await service.fetchAccountByID(account_id);
  if (!account) {
    return res.status(400).json({ success: false, message: 'User not found' });
  }

  // Validate and handle the sex field
  let validSex = sex;
  if (sex !== 'Nam' && sex !== 'Nữ') {
    validSex = '';
  }

  try {
    const result = await service.updateProfileInfoByID(account_id, {
      name,
      address,
      birthdate,
      sex: validSex,
      phone,
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
}

// POST /info - Update profile information
router.post('', updateProfile);

router.post('/avatar', upload.single('avatar'), async (req, res) => {
  const account_id = req.user.id;

  if (!account_id) {
    return res.status(400).json({
      success: false,
      message: 'Account ID is required',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Avatar image is required.',
    });
  }

  try {
    // Update the avatar in Cloudinary and Prisma database
    const result = await service.updateAvatarByID(account_id, req.file);

    res.status(200).json({
      success: true,
      message: result.message,
      avatar_url: result.avatar_url, // Return the new avatar URL
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.message,
    });
  }
});

export default router;
