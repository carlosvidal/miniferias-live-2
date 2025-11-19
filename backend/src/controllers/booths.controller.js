import prisma from '../config/prisma.js';
import { generateAgoraToken } from '../services/agora.service.js';
import { StreamProviderFactory } from '../services/streaming/StreamProviderFactory.js';

// Helper function to generate a valid stream UID from user ID
// Most streaming providers require numeric UIDs or support both numeric/string
function generateStreamUid(userId) {
  // Create a simple hash from the UUID
  let hash = 0;
  const cleanId = userId.replace(/-/g, '');
  for (let i = 0; i < cleanId.length; i++) {
    hash = ((hash << 5) - hash) + cleanId.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Return a positive number in range [1, 10000]
  return Math.abs(hash % 10000) + 1;
}

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

    // Allow creating booth without user only if ADMIN
    if (!userId && req.user.role !== 'ADMIN') {
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

    // Prepare booth data with optional member
    const boothCreateData = {
      ...boothData
    };

    // Only add member if userId is provided
    if (userId) {
      boothCreateData.members = {
        create: {
          userId: userId,
          role: 'OWNER'
        }
      };
    }

    // Create booth
    const booth = await prisma.booth.create({
      data: boothCreateData,
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
        },
        event: {
          select: {
            streamProvider: true
          }
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

    // Generate channel name
    const channelName = `booth-${booth.id}`;
    const provider = booth.event.streamProvider || 'AGORA';

    // Get streaming provider
    const streamProvider = StreamProviderFactory.createProvider(provider);

    // Create channel configuration
    const channelConfig = await streamProvider.createChannel(channelName);

    // Update booth
    const updatedBooth = await prisma.booth.update({
      where: { id },
      data: {
        isStreaming: true,
        streamStarted: new Date(),
        streamChannel: channelName,
        streamConfig: channelConfig
      }
    });

    // Generate token for host
    const uid = generateStreamUid(req.user.id);
    const tokenData = await streamProvider.generateToken(channelName, uid, 'host');

    res.json({
      message: 'Streaming started successfully',
      booth: updatedBooth,
      streaming: tokenData
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
        streamChannel: null,
        streamConfig: null,
        currentViewers: 0
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
        } : false,
        event: {
          select: {
            streamProvider: true
          }
        }
      }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    if (!booth.isStreaming || !booth.streamChannel) {
      return res.status(400).json({ error: 'Booth is not currently streaming' });
    }

    // Get streaming provider
    const provider = booth.event.streamProvider || 'AGORA';
    const streamProvider = StreamProviderFactory.createProvider(provider);

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
      ? generateStreamUid(req.user.id)
      : Math.floor(Math.random() * 10000) + 1;

    const tokenData = await streamProvider.generateToken(booth.streamChannel, uid, role);

    res.json(tokenData);
  } catch (error) {
    console.error('Get stream token error:', error);
    res.status(500).json({ error: 'Failed to get stream token' });
  }
}

// Booth Members Management
export async function addBoothMember(req, res) {
  try {
    const { id } = req.params; // booth id
    const { userId, email, role = 'OPERATOR' } = req.body;

    // Find user by userId or email
    let targetUserId = userId;
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found with that email' });
      }

      targetUserId = user.id;
    }

    if (!targetUserId) {
      return res.status(400).json({ error: 'Either userId or email is required' });
    }

    // Check if booth exists and user has permission
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

    // Only ADMIN or booth OWNER can add members
    const membership = booth.members[0];
    const canAddMember = req.user.role === 'ADMIN' || (membership && membership.role === 'OWNER');

    if (!canAddMember) {
      return res.status(403).json({ error: 'Not authorized to add members to this booth' });
    }

    // Check if user is already a member
    const existingMember = await prisma.boothMember.findUnique({
      where: {
        userId_boothId: {
          userId: targetUserId,
          boothId: id
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this booth' });
    }

    // Add member
    const newMember = await prisma.boothMember.create({
      data: {
        userId: targetUserId,
        boothId: id,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Member added successfully',
      member: newMember
    });
  } catch (error) {
    console.error('Add booth member error:', error);
    res.status(500).json({ error: 'Failed to add booth member' });
  }
}

export async function removeBoothMember(req, res) {
  try {
    const { id, memberId } = req.params; // booth id and membership id

    // Check if booth exists and user has permission
    const booth = await prisma.booth.findUnique({
      where: { id },
      include: {
        members: true
      }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    // Find the membership to remove
    const membershipToRemove = await prisma.boothMember.findUnique({
      where: { id: memberId }
    });

    if (!membershipToRemove || membershipToRemove.boothId !== id) {
      return res.status(404).json({ error: 'Member not found in this booth' });
    }

    // Check permission
    const currentUserMembership = booth.members.find(m => m.userId === req.user.id);
    const canRemoveMember = req.user.role === 'ADMIN' ||
                            (currentUserMembership && currentUserMembership.role === 'OWNER') ||
                            membershipToRemove.userId === req.user.id; // Can remove self

    if (!canRemoveMember) {
      return res.status(403).json({ error: 'Not authorized to remove members from this booth' });
    }

    // Prevent removing the last OWNER
    if (membershipToRemove.role === 'OWNER') {
      const ownerCount = booth.members.filter(m => m.role === 'OWNER').length;
      if (ownerCount === 1) {
        return res.status(400).json({ error: 'Cannot remove the last owner. Assign another owner first.' });
      }
    }

    // Remove member
    await prisma.boothMember.delete({
      where: { id: memberId }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove booth member error:', error);
    res.status(500).json({ error: 'Failed to remove booth member' });
  }
}

export async function updateBoothMemberRole(req, res) {
  try {
    const { id, memberId } = req.params; // booth id and membership id
    const { role } = req.body;

    if (!role || !['OWNER', 'OPERATOR', 'MODERATOR'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required (OWNER, OPERATOR, MODERATOR)' });
    }

    // Check if booth exists and user has permission
    const booth = await prisma.booth.findUnique({
      where: { id },
      include: {
        members: true
      }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    // Find the membership to update
    const membershipToUpdate = booth.members.find(m => m.id === memberId);

    if (!membershipToUpdate) {
      return res.status(404).json({ error: 'Member not found in this booth' });
    }

    // Only ADMIN or booth OWNER can update roles
    const currentUserMembership = booth.members.find(m => m.userId === req.user.id);
    const canUpdateRole = req.user.role === 'ADMIN' ||
                          (currentUserMembership && currentUserMembership.role === 'OWNER');

    if (!canUpdateRole) {
      return res.status(403).json({ error: 'Not authorized to update member roles' });
    }

    // If changing from OWNER to something else, ensure there's another OWNER
    if (membershipToUpdate.role === 'OWNER' && role !== 'OWNER') {
      const ownerCount = booth.members.filter(m => m.role === 'OWNER').length;
      if (ownerCount === 1) {
        return res.status(400).json({ error: 'Cannot change the last owner role. Assign another owner first.' });
      }
    }

    // Update role
    const updatedMember = await prisma.boothMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Member role updated successfully',
      member: updatedMember
    });
  } catch (error) {
    console.error('Update booth member role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
}
