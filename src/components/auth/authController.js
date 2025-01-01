import express from 'express';
import passport, { isEmailExist, register } from './authService.js';

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res, next) => {
    // Passport.authenticate(): in this case is a customer callback that return a middleware function which accepted parameters (req, res, next)
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            next(err); // Execute middleware function defined in app.js which handled error
        }
        if (!user) {
            // Authentication failed, render login with error message
            // return res.render('login', { message: info.message });
            return res.json({ success: false, message: info.message });
        }
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            // Return res.redirect('/');
            return res.json({ success: true, redirectUrl: '/' });
        });
    })(req, res, next);
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        return res.redirect('/');
    });
});

export default router;