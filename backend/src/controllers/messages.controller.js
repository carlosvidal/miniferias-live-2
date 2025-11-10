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
      include: { booth: true }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only admin or booth owner or message author can delete
    const canDelete =
      req.user.role === 'ADMIN' ||
      message.userId === req.user.id ||
      message.booth.userId === req.user.id;

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
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          boothId,
          isDeleted: false
        },
        skip,
        take: parseInt(limit),
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
        where: {
          boothId,
          isDeleted: false
        }
      })
    ]);

    res.json({
      messages,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get booth messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
}
