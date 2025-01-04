import express from 'express';
import passport from './authService.js';

const router = express.Router();

// Handle login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Authentication failed
      return res.status(400).json({ success: false, message: info.message });
    }

    req.login(user, async (err) => {
      if (err) return next(err);
      return res.status(200).json({
        success: true,
        redirectUrl: '/',
      });
    });
  })(req, res, next);
});

router.get(
  '/google',
  passport.authenticate('google', {
    prompt: 'select_account', // Force to select account
    scope: ['email', 'profile'],
  }),
);

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Authentication failed
      return res.redirect('/');
    }

    req.login(user, (err) => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
});

// Handle logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    return res.redirect('/');
  });
});

export default router;
