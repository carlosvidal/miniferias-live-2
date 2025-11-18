import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware specifically for OAuth linking endpoints
 * Accepts JWT token from query parameter instead of Authorization header
 * Stores user ID in session for the OAuth flow
 */
export function authenticateForLink(req, res, next) {
  try {
    // Get token from query parameter
    const token = req.query.token;

    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/profile?error=no_token`);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store user ID in session for OAuth callback
    req.session.linkingUserId = decoded.userId;

    // Also attach to req.user for consistency with regular auth
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Link authentication error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/profile?error=invalid_token`);
  }
}
