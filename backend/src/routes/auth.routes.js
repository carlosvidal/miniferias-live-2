import express from 'express';
import { register, login, getMe, updateProfile, oauthCallback, oauthFailure, oauthLinkCallback, unlinkProvider } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authenticateForLink } from '../middleware/auth-link.middleware.js';
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

// Link additional auth providers (for already authenticated users)
// Uses authenticateForLink which accepts token from query param
// Stores user ID in session before OAuth, then links after successful OAuth
router.get('/link/google', authenticateForLink, (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })(req, res, next);
});
router.get('/link/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    session: false
  }),
  oauthLinkCallback
);

router.get('/link/facebook', authenticateForLink, (req, res, next) => {
  passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    session: false
  })(req, res, next);
});
router.get('/link/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/failure',
    session: false
  }),
  oauthLinkCallback
);

router.get('/link/tiktok', authenticateForLink, (req, res, next) => {
  passport.authenticate('tiktok', {
    session: false
  })(req, res, next);
});
router.get('/link/tiktok/callback',
  passport.authenticate('tiktok', {
    failureRedirect: '/auth/failure',
    session: false
  }),
  oauthLinkCallback
);

// Unlink auth provider
router.delete('/provider/:provider', authenticate, unlinkProvider);

export default router;
