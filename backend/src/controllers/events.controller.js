import prisma from '../config/prisma.js';
import { generateSlug, paginate } from '../utils/helpers.js';

export async function createEvent(req, res) {
  try {
    const { name, description, coverImage, startDate, endDate, status } = req.body;

    // Generate unique slug
    let slug = generateSlug(name);
    let slugExists = await prisma.event.findUnique({ where: { slug } });
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await prisma.event.findUnique({ where: { slug } });
      counter++;
    }

    const event = await prisma.event.create({
      data: {
        name,
        slug,
        description,
        coverImage,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'DRAFT'
      }
    });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

export async function getEvents(req, res) {
  try {
    const { page = 1, limit = 10, status, isLive, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (isLive !== undefined) where.isLive = isLive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        ...paginate(parseInt(page), parseInt(limit)),
        orderBy: { startDate: 'desc' },
        include: {
          _count: {
            select: { booths: true }
          }
        }
      }),
      prisma.event.count({ where })
    ]);

    res.json({
      events,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
}

export async function getEventById(req, res) {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        booths: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: { products: true }
            }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
}

export async function getEventBySlug(req, res) {
  try {
    const { slug } = req.params;

    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        booths: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true
              }
            },
            _count: {
              select: { products: true }
            }
          },
          orderBy: { isStreaming: 'desc' }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event by slug error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
}

export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If name is being updated, regenerate slug
    if (updates.name) {
      let slug = generateSlug(updates.name);
      let slugExists = await prisma.event.findFirst({
        where: { slug, NOT: { id } }
      });
      let counter = 1;

      while (slugExists) {
        slug = `${generateSlug(updates.name)}-${counter}`;
        slugExists = await prisma.event.findFirst({
          where: { slug, NOT: { id } }
        });
        counter++;
      }
      updates.slug = slug;
    }

    const event = await prisma.event.update({
      where: { id },
      data: updates
    });

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Event not found' });
    }
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
}

export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;

    await prisma.event.delete({
      where: { id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Event not found' });
    }
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
}

export async function getEventStats(req, res) {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        booths: {
          include: {
            orders: true,
            _count: {
              select: { messages: true }
            }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const totalBooths = event.booths.length;
    const totalOrders = event.booths.reduce((sum, booth) => sum + booth.orders.length, 0);
    const totalSales = event.booths.reduce((sum, booth) => {
      return sum + booth.orders.reduce((orderSum, order) => {
        return orderSum + parseFloat(order.total);
      }, 0);
    }, 0);
    const totalMessages = event.booths.reduce((sum, booth) => sum + booth._count.messages, 0);

    res.json({
      event: {
        id: event.id,
        name: event.name,
        status: event.status
      },
      stats: {
        totalBooths,
        totalOrders,
        totalSales: totalSales.toFixed(2),
        totalMessages
      }
    });
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({ error: 'Failed to get event stats' });
  }
}
