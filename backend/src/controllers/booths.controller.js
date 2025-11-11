import prisma from '../config/prisma.js';
import { generateAgoraToken } from '../services/agora.service.js';

export async function createBooth(req, res) {
  try {
    const { exhibitorEmail, ...boothData } = req.body;

    // Find user by email if provided
    let userId = boothData.userId;
    if (exhibitorEmail) {
      const user = await prisma.user.findUnique({
        where: { email: exhibitorEmail }
      });

      if (!user) {
        return res.status(404).json({ error: 'Exhibitor not found with that email' });
      }

      if (user.role !== 'EXHIBITOR') {
        return res.status(400).json({ error: 'User must have EXHIBITOR role' });
      }

      userId = user.id;
    }

    if (!userId) {
      return res.status(400).json({ error: 'Either userId or exhibitorEmail is required' });
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: boothData.eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Remove userId from boothData (no longer part of Booth model)
    delete boothData.userId;

    // Create booth with owner as member (Many-to-Many)
    const booth = await prisma.booth.create({
      data: {
        ...boothData,
        members: {
          create: {
            userId: userId,
            role: 'OWNER'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        event: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Booth created successfully',
      booth
    });
  } catch (error) {
    console.error('Create booth error:', error);
    res.status(500).json({ error: 'Failed to create booth' });
  }
}

export async function getBooths(req, res) {
  try {
    const { eventId, isStreaming } = req.query;

    const where = {};
    if (eventId) where.eventId = eventId;
    if (isStreaming !== undefined) where.isStreaming = isStreaming === 'true';

    const booths = await prisma.booth.findMany({
      where,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        event: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ booths });
  } catch (error) {
    console.error('Get booths error:', error);
    res.status(500).json({ error: 'Failed to get booths' });
  }
}

export async function getBoothById(req, res) {
  try {
    const { id } = req.params;

    const booth = await prisma.booth.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true
              }
            }
          }
        },
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true
          }
        },
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    res.json(booth);
  } catch (error) {
    console.error('Get booth error:', error);
    res.status(500).json({ error: 'Failed to get booth' });
  }
}

export async function updateBooth(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify booth exists and user has permission
    const existingBooth = await prisma.booth.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId: req.user.id }
        }
      }
    });

    if (!existingBooth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    // Check if user is a member with OWNER or OPERATOR role
    const membership = existingBooth.members[0];
    const canUpdate = req.user.role === 'ADMIN' ||
                      (membership && (membership.role === 'OWNER' || membership.role === 'OPERATOR'));

    if (!canUpdate) {
      return res.status(403).json({ error: 'Not authorized to update this booth' });
    }

    const booth = await prisma.booth.update({
      where: { id },
      data: updates
    });

    res.json({
      message: 'Booth updated successfully',
      booth
    });
  } catch (error) {
    console.error('Update booth error:', error);
    res.status(500).json({ error: 'Failed to update booth' });
  }
}

export async function deleteBooth(req, res) {
  try {
    const { id } = req.params;

    await prisma.booth.delete({
      where: { id }
    });

    res.json({ message: 'Booth deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Booth not found' });
    }
    console.error('Delete booth error:', error);
    res.status(500).json({ error: 'Failed to delete booth' });
  }
}

export async function getMyBooth(req, res) {
  try {
    // Find booths where user is a member
    const booths = await prisma.booth.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            startDate: true,
            endDate: true
          }
        },
        products: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            orders: true,
            messages: true
          }
        }
      }
    });

    if (booths.length === 0) {
      return res.status(404).json({ error: 'You do not have a booth yet' });
    }

    // For backwards compatibility, return first booth if only one exists
    // In the future, we can return all booths
    const booth = booths[0];

    res.json(booth);
  } catch (error) {
    console.error('Get my booth error:', error);
    res.status(500).json({ error: 'Failed to get booth' });
  }
}

export async function startStreaming(req, res) {
  try {
    const { id } = req.params;

    const booth = await prisma.booth.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId: req.user.id }
        }
      }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    // Check if user is a member with OWNER or OPERATOR role
    const membership = booth.members[0];
    const canStartStreaming = req.user.role === 'ADMIN' ||
                               (membership && (membership.role === 'OWNER' || membership.role === 'OPERATOR'));

    if (!canStartStreaming) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Generate Agora channel name
    const channelName = `booth-${booth.id}`;

    // Update booth
    const updatedBooth = await prisma.booth.update({
      where: { id },
      data: {
        isStreaming: true,
        streamStarted: new Date(),
        agoraChannel: channelName
      }
    });

    // Generate Agora token for host
    const agoraData = generateAgoraToken(channelName, parseInt(req.user.id.replace(/-/g, '').substring(0, 10), 16), 'host');

    res.json({
      message: 'Streaming started successfully',
      booth: updatedBooth,
      agora: agoraData
    });
  } catch (error) {
    console.error('Start streaming error:', error);
    res.status(500).json({ error: 'Failed to start streaming' });
  }
}

export async function stopStreaming(req, res) {
  try {
    const { id } = req.params;

    const booth = await prisma.booth.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId: req.user.id }
        }
      }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    // Check if user is a member with OWNER or OPERATOR role
    const membership = booth.members[0];
    const canStopStreaming = req.user.role === 'ADMIN' ||
                              (membership && (membership.role === 'OWNER' || membership.role === 'OPERATOR'));

    if (!canStopStreaming) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedBooth = await prisma.booth.update({
      where: { id },
      data: {
        isStreaming: false,
        agoraChannel: null
      }
    });

    res.json({
      message: 'Streaming stopped successfully',
      booth: updatedBooth
    });
  } catch (error) {
    console.error('Stop streaming error:', error);
    res.status(500).json({ error: 'Failed to stop streaming' });
  }
}

export async function getStreamToken(req, res) {
  try {
    const { id } = req.params;

    const booth = await prisma.booth.findUnique({
      where: { id },
      include: {
        members: req.user ? {
          where: { userId: req.user.id }
        } : false
      }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    if (!booth.isStreaming || !booth.agoraChannel) {
      return res.status(400).json({ error: 'Booth is not currently streaming' });
    }

    // Determine role based on membership
    let role = 'audience';
    if (req.user && booth.members && booth.members.length > 0) {
      const membership = booth.members[0];
      // OWNER and OPERATOR can be host, MODERATOR is audience with special privileges
      if (membership.role === 'OWNER' || membership.role === 'OPERATOR') {
        role = 'host';
      }
    }

    const uid = req.user
      ? parseInt(req.user.id.replace(/-/g, '').substring(0, 10), 16)
      : Math.floor(Math.random() * 100000);

    const agoraData = generateAgoraToken(booth.agoraChannel, uid, role);

    res.json(agoraData);
  } catch (error) {
    console.error('Get stream token error:', error);
    res.status(500).json({ error: 'Failed to get stream token' });
  }
}
