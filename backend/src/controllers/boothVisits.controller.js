import prisma from '../config/prisma.js';
import oneSignalService from '../services/onesignal.service.js';

/**
 * Registrar entrada de un visitante a un booth
 * POST /api/booths/:id/visits
 */
export async function recordBoothEntry(req, res) {
  try {
    const { id: boothId } = req.params;
    const userId = req.user.id;
    const { source } = req.body; // Opcional: 'direct', 'search', 'event_page', etc.

    // Verificar que el booth existe
    const booth = await prisma.booth.findUnique({
      where: { id: boothId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    // Verificar que el usuario no sea un miembro del booth
    const isMember = booth.members.some(member => member.userId === userId);
    if (isMember) {
      // Los miembros del booth no generan notificaciones de visita
      return res.status(200).json({
        message: 'Booth member entry not recorded',
        isMember: true
      });
    }

    // Obtener información del visitante
    const visitor = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true
      }
    });

    if (!visitor) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verificar si ya hay una visita activa (sin exitTime)
    const activeVisit = await prisma.boothVisit.findFirst({
      where: {
        boothId,
        userId,
        exitTime: null
      },
      orderBy: {
        entryTime: 'desc'
      }
    });

    if (activeVisit) {
      // Ya existe una visita activa, no crear una nueva
      return res.status(200).json({
        message: 'Active visit already exists',
        visit: activeVisit
      });
    }

    // Crear nuevo registro de visita
    const visit = await prisma.boothVisit.create({
      data: {
        boothId,
        userId,
        source: source || 'direct',
        entryTime: new Date()
      },
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
    });

    // Enviar notificación a los miembros del booth
    try {
      const memberUserIds = booth.members.map(member => member.userId);

      if (memberUserIds.length > 0) {
        await oneSignalService.sendVisitorEnteredBooth(
          {
            id: booth.id,
            name: booth.name
          },
          visitor,
          memberUserIds
        );
      }
    } catch (notificationError) {
      // Log error but don't fail the request
      console.error('Error sending notification:', notificationError);
    }

    res.status(201).json({
      message: 'Booth visit recorded successfully',
      visit
    });

  } catch (error) {
    console.error('Error recording booth entry:', error);
    res.status(500).json({ error: 'Failed to record booth entry' });
  }
}

/**
 * Registrar salida de un visitante de un booth
 * POST /api/booths/:id/visits/exit
 */
export async function recordBoothExit(req, res) {
  try {
    const { id: boothId } = req.params;
    const userId = req.user.id;

    // Buscar la visita activa más reciente
    const activeVisit = await prisma.boothVisit.findFirst({
      where: {
        boothId,
        userId,
        exitTime: null
      },
      orderBy: {
        entryTime: 'desc'
      }
    });

    if (!activeVisit) {
      return res.status(404).json({ error: 'No active visit found' });
    }

    // Calcular duración en segundos
    const exitTime = new Date();
    const entryTime = new Date(activeVisit.entryTime);
    const duration = Math.floor((exitTime - entryTime) / 1000);

    // Actualizar la visita con la hora de salida y duración
    const visit = await prisma.boothVisit.update({
      where: { id: activeVisit.id },
      data: {
        exitTime,
        duration
      }
    });

    res.status(200).json({
      message: 'Booth exit recorded successfully',
      visit
    });

  } catch (error) {
    console.error('Error recording booth exit:', error);
    res.status(500).json({ error: 'Failed to record booth exit' });
  }
}

/**
 * Obtener estadísticas de visitas de un booth
 * GET /api/booths/:id/visits/stats
 */
export async function getBoothVisitStats(req, res) {
  try {
    const { id: boothId } = req.params;
    const userId = req.user.id;

    // Verificar que el booth existe
    const booth = await prisma.booth.findUnique({
      where: { id: boothId },
      include: {
        members: true
      }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    // Verificar que el usuario es miembro del booth o admin
    const isMember = booth.members.some(member => member.userId === userId);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isMember && !isAdmin) {
      return res.status(403).json({ error: 'Access denied. You must be a booth member to view statistics.' });
    }

    // Obtener estadísticas
    const totalVisits = await prisma.boothVisit.count({
      where: { boothId }
    });

    const uniqueVisitors = await prisma.boothVisit.groupBy({
      by: ['userId'],
      where: { boothId }
    });

    const currentVisitors = await prisma.boothVisit.count({
      where: {
        boothId,
        exitTime: null
      }
    });

    // Obtener visitas recientes (últimas 20)
    const recentVisits = await prisma.boothVisit.findMany({
      where: { boothId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true
          }
        }
      },
      orderBy: {
        entryTime: 'desc'
      },
      take: 20
    });

    // Calcular duración promedio (solo visitas completadas)
    const completedVisits = await prisma.boothVisit.findMany({
      where: {
        boothId,
        exitTime: { not: null },
        duration: { not: null }
      },
      select: {
        duration: true
      }
    });

    const averageDuration = completedVisits.length > 0
      ? Math.floor(completedVisits.reduce((sum, visit) => sum + (visit.duration || 0), 0) / completedVisits.length)
      : 0;

    res.status(200).json({
      boothId,
      boothName: booth.name,
      stats: {
        totalVisits,
        uniqueVisitors: uniqueVisitors.length,
        currentVisitors,
        averageDuration, // en segundos
        averageDurationMinutes: Math.floor(averageDuration / 60)
      },
      recentVisits
    });

  } catch (error) {
    console.error('Error getting booth visit stats:', error);
    res.status(500).json({ error: 'Failed to get booth visit statistics' });
  }
}

/**
 * Obtener lista de visitantes actuales en un booth
 * GET /api/booths/:id/visitors/current
 */
export async function getCurrentVisitors(req, res) {
  try {
    const { id: boothId } = req.params;
    const userId = req.user.id;

    // Verificar que el booth existe
    const booth = await prisma.booth.findUnique({
      where: { id: boothId },
      include: {
        members: true
      }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    // Verificar que el usuario es miembro del booth o admin
    const isMember = booth.members.some(member => member.userId === userId);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isMember && !isAdmin) {
      return res.status(403).json({ error: 'Access denied. You must be a booth member to view current visitors.' });
    }

    // Obtener visitantes actuales
    const currentVisits = await prisma.boothVisit.findMany({
      where: {
        boothId,
        exitTime: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            role: true
          }
        }
      },
      orderBy: {
        entryTime: 'desc'
      }
    });

    res.status(200).json({
      boothId,
      boothName: booth.name,
      count: currentVisits.length,
      visitors: currentVisits
    });

  } catch (error) {
    console.error('Error getting current visitors:', error);
    res.status(500).json({ error: 'Failed to get current visitors' });
  }
}
