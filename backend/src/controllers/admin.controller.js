import prisma from '../config/prisma.js';

export async function getStats(req, res) {
  try {
    // Get counts in parallel
    const [
      totalUsers,
      totalEvents,
      totalBooths,
      totalProducts,
      totalOrders,
      recentOrders,
      usersByRole,
      ordersByStatus
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.booth.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          },
          booth: {
            select: { name: true }
          }
        }
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    // Calculate total revenue
    const ordersWithTotal = await prisma.order.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED'] }
      },
      select: { total: true }
    });

    const totalRevenue = ordersWithTotal.reduce((sum, order) => sum + order.total, 0);

    // Format user counts by role
    const users = {
      admin: usersByRole.find(u => u.role === 'ADMIN')?._count.role || 0,
      exhibitor: usersByRole.find(u => u.role === 'EXHIBITOR')?._count.role || 0,
      visitor: usersByRole.find(u => u.role === 'VISITOR')?._count.role || 0
    };

    // Format order counts by status
    const orders = {
      pending: ordersByStatus.find(o => o.status === 'PENDING')?._count.status || 0,
      confirmed: ordersByStatus.find(o => o.status === 'CONFIRMED')?._count.status || 0,
      preparing: ordersByStatus.find(o => o.status === 'PREPARING')?._count.status || 0,
      shipped: ordersByStatus.find(o => o.status === 'SHIPPED')?._count.status || 0,
      delivered: ordersByStatus.find(o => o.status === 'DELIVERED')?._count.status || 0,
      cancelled: ordersByStatus.find(o => o.status === 'CANCELLED')?._count.status || 0
    };

    res.json({
      stats: {
        totalUsers,
        totalEvents,
        totalBooths,
        totalProducts,
        totalOrders,
        totalRevenue,
        users,
        orders
      },
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
