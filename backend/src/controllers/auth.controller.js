import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
import prisma from '../config/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

export async function register(req, res) {
  try {
    const { email, password, name, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: role || 'VISITOR'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        profilePicture: true,
        createdAt: true
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        profilePicture: true,
        provider: true,
        shippingAddress: true,
        createdAt: true,
        authProviders: {
          select: {
            provider: true,
            createdAt: true
          }
        },
        boothMemberships: {
          include: {
            booth: {
              select: {
                id: true,
                name: true,
                eventId: true
              }
            }
          }
        }
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, phone, profilePicture, shippingAddress } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(profilePicture && { profilePicture }),
        ...(shippingAddress && { shippingAddress })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        profilePicture: true,
        shippingAddress: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

/**
 * OAuth callback handler - handles successful OAuth authentication
 * Creates JWT token and redirects to frontend with token
 */
export async function oauthCallback(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Redirect to frontend with token
    // The frontend will extract the token from the URL and store it
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
  }
}

/**
 * OAuth failure handler
 */
export async function oauthFailure(req, res) {
  res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
}

/**
 * OAuth callback for linking providers - handles authenticated users linking additional providers
 */
export async function oauthLinkCallback(req, res) {
  try {
    const authenticatedUser = req.user; // This comes from Passport OAuth
    const existingUserId = req.session?.linkingUserId; // User ID stored in session before OAuth

    if (!authenticatedUser) {
      return res.redirect(`${process.env.FRONTEND_URL}/profile?error=link_failed`);
    }

    if (!existingUserId) {
      return res.redirect(`${process.env.FRONTEND_URL}/profile?error=no_session`);
    }

    // Get the provider info from the OAuth user
    const provider = authenticatedUser.provider;
    const providerId = authenticatedUser.providerId;

    // Check if this provider is already linked to another user
    const existingLink = await prisma.userAuthProvider.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId
        }
      }
    });

    if (existingLink && existingLink.userId !== existingUserId) {
      return res.redirect(`${process.env.FRONTEND_URL}/profile?error=provider_already_linked`);
    }

    if (!existingLink) {
      // Link the provider to the existing user
      await prisma.userAuthProvider.create({
        data: {
          userId: existingUserId,
          provider,
          providerId
        }
      });
    }

    // Clear session
    delete req.session.linkingUserId;

    // Redirect to profile with success
    res.redirect(`${process.env.FRONTEND_URL}/profile?linked=${provider.toLowerCase()}`);
  } catch (error) {
    console.error('OAuth link callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/profile?error=link_callback_failed`);
  }
}

/**
 * Unlink an authentication provider
 */
export async function unlinkProvider(req, res) {
  try {
    const { provider } = req.params;
    const userId = req.user.id;

    // Validate provider
    const validProviders = ['GOOGLE', 'FACEBOOK', 'TIKTOK', 'LOCAL'];
    if (!validProviders.includes(provider.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    const providerEnum = provider.toUpperCase();

    // Check how many auth providers the user has
    const authProviders = await prisma.userAuthProvider.findMany({
      where: { userId }
    });

    // Don't allow unlinking if it's the only auth method
    if (authProviders.length <= 1) {
      return res.status(400).json({
        error: 'Cannot unlink the only authentication method. Please link another provider first.'
      });
    }

    // Check if LOCAL provider - special handling for password-based auth
    if (providerEnum === 'LOCAL') {
      // Check if user has a password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user?.password) {
        return res.status(400).json({ error: 'Local authentication not set up' });
      }

      // Remove password (set to null)
      await prisma.user.update({
        where: { id: userId },
        data: { password: null }
      });

      // Remove LOCAL auth provider entry if exists
      await prisma.userAuthProvider.deleteMany({
        where: {
          userId,
          provider: 'LOCAL'
        }
      });
    } else {
      // Unlink the provider
      const deletedProvider = await prisma.userAuthProvider.deleteMany({
        where: {
          userId,
          provider: providerEnum
        }
      });

      if (deletedProvider.count === 0) {
        return res.status(404).json({ error: 'Provider not linked to your account' });
      }
    }

    res.json({
      message: `${provider} unlinked successfully`,
      provider: providerEnum
    });
  } catch (error) {
    console.error('Unlink provider error:', error);
    res.status(500).json({ error: 'Failed to unlink provider' });
  }
}
