import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendDataDeletionConfirmation } from '../services/email.service.js';

export async function getUsers(req, res) {
  try {
    const { role, search } = req.query;

    const where = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            boothMemberships: true,
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
}

export async function createUser(req, res) {
  try {
    const { email, password, name, phone, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
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
        phone: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['VISITOR', 'EXHIBITOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent changing own role
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    // Update role
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        boothMemberships: true,
        orders: true
      }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting own account
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user has booth memberships
    if (existingUser.boothMemberships.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete user with active booth memberships. Please remove user from booths first.'
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

// Request account deletion (user initiated)
export async function requestDeletion(req, res) {
  try {
    const userId = req.user.id;
    const { reason } = req.body;

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate deletion token (expires in 24 hours)
    const deletionToken = jwt.sign(
      { userId: user.id, purpose: 'account_deletion' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send confirmation email
    await sendDataDeletionConfirmation(user, deletionToken, reason);

    res.json({
      message: 'Deletion request received. Please check your email to confirm.',
      email: user.email
    });
  } catch (error) {
    console.error('Request deletion error:', error);
    res.status(500).json({ error: 'Failed to process deletion request' });
  }
}

// Confirm and execute account deletion
export async function confirmDeletion(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Deletion token is required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ error: 'Deletion link has expired. Please request a new one.' });
      }
      return res.status(400).json({ error: 'Invalid deletion token' });
    }

    // Validate token purpose
    if (decoded.purpose !== 'account_deletion') {
      return res.status(400).json({ error: 'Invalid token purpose' });
    }

    const userId = decoded.userId;

    // Get user data before deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        boothMemberships: true,
        orders: true,
        messages: true,
        pushSubscriptions: true,
        authProviders: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found or already deleted' });
    }

    // Perform deletion in transaction
    await prisma.$transaction(async (tx) => {
      // Delete related data (cascade will handle most, but we'll be explicit)

      // Soft delete messages (mark as deleted, keep for compliance)
      await tx.message.updateMany({
        where: { userId },
        data: { isDeleted: true, content: '[Usuario eliminado]' }
      });

      // Delete push subscriptions
      await tx.pushSubscription.deleteMany({
        where: { userId }
      });

      // Delete booth memberships
      await tx.boothMember.deleteMany({
        where: { userId }
      });

      // Delete linked auth providers
      await tx.userAuthProvider.deleteMany({
        where: { userId }
      });

      // Note: Orders are retained for legal/accounting purposes but user reference will be set to null
      // We'll anonymize the user info in shipping address
      const orders = await tx.order.findMany({
        where: { userId }
      });

      for (const order of orders) {
        const shippingAddress = order.shippingAddress;
        if (typeof shippingAddress === 'object' && shippingAddress !== null) {
          await tx.order.update({
            where: { id: order.id },
            data: {
              shippingAddress: {
                ...shippingAddress,
                name: '[Usuario eliminado]',
                phone: '[Eliminado]',
                email: '[Eliminado]'
              }
            }
          });
        }
      }

      // Update orders to disconnect from user (set userId to a system user or handle appropriately)
      // For now, we'll keep the userId reference for accounting but the user data is anonymized

      // Finally, delete the user account
      await tx.user.delete({
        where: { id: userId }
      });
    });

    console.log(`User account deleted: ${userId}`);

    res.json({
      message: 'Your account and personal data have been successfully deleted.',
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Confirm deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
}
