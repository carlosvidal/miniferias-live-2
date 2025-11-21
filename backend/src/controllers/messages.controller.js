import prisma from '../config/prisma.js';

export async function createMessage(req, res) {
  try {
    const { boothId, content } = req.body;

    // Verify booth exists
    const booth = await prisma.booth.findUnique({
      where: { id: boothId }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    // Rate limiting check: max 5 messages per minute per user
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentMessages = await prisma.message.findMany({
      where: {
        userId: req.user.id,
        boothId,
        createdAt: { gte: oneMinuteAgo }
      }
    });

    if (recentMessages.length >= 5) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Maximum 5 messages per minute'
      });
    }

    const message = await prisma.message.create({
      data: {
        userId: req.user.id,
        boothId,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

export async function getMessages(req, res) {
  try {
    const { boothId } = req.params;
    const { limit = 50, before } = req.query;

    const where = {
      boothId,
      isDeleted: false
    };

    if (before) {
      where.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.message.findMany({
      where,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    // Reverse to get chronological order
    messages.reverse();

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
}

export async function deleteMessage(req, res) {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        booth: {
          include: {
            members: {
              where: { userId: req.user.id }
            }
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only admin, booth member (OWNER/OPERATOR/MODERATOR), or message author can delete
    const isMember = message.booth.members.length > 0;
    const canDelete =
      req.user.role === 'ADMIN' ||
      message.userId === req.user.id ||
      isMember;

    if (!canDelete) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await prisma.message.update({
      where: { id },
      data: { isDeleted: true }
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
}

export async function getBoothMessages(req, res) {
  try {
    const { boothId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // For privacy and freshness: only show messages from last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const skip = (page - 1) * limit;

    // Cap limit at 20 messages maximum
    const maxLimit = Math.min(parseInt(limit), 20);

    const where = {
      boothId,
      isDeleted: false,
      createdAt: { gte: fiveMinutesAgo }
    };

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: maxLimit,
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profilePicture: true
            }
          }
        }
      }),
      prisma.message.count({
        where
      })
    ]);

    res.json({
      messages,
      pagination: {
        total,
        page: parseInt(page),
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit)
      }
    });
  } catch (error) {
    console.error('Get booth messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
}
