import express from 'express';
import { register, login, getMe, updateProfile, oauthCallback, oauthFailure } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../utils/validators.js';
import passport from '../config/passport.js';

const router = express.Router();

// Traditional auth
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    session: false
  }),
  oauthCallback
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email', 'public_profile'],
  session: false
}));
router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/failure',
    session: false
  }),
  oauthCallback
);

// TikTok OAuth
router.get('/tiktok', passport.authenticate('tiktok', {
  session: false
}));
router.get('/tiktok/callback',
  passport.authenticate('tiktok', {
    failureRedirect: '/auth/failure',
    session: false
  }),
  oauthCallback
);

// OAuth failure route
router.get('/failure', oauthFailure);

export default router;
