import prisma from '../config/prisma.js';
import { generateOrderNumber, calculateOrderTotals } from '../utils/helpers.js';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../services/email.service.js';

export async function createOrder(req, res) {
  try {
    const { boothId, items, shippingAddress, paymentMethod, paymentProof, saveShippingAddress } = req.body;

    // Verify booth exists and check membership
    const booth = await prisma.booth.findUnique({
      where: { id: boothId },
      include: {
        members: {
          where: { userId: req.user.id }
        }
      }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    // Prevent exhibitors from buying from their own booth
    if (booth.members.length > 0) {
      return res.status(403).json({
        error: 'No puedes comprar productos de tu propio booth'
      });
    }

    // Fetch products and verify stock
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, boothId }
    });

    if (products.length !== items.length) {
      return res.status(400).json({ error: 'Some products not found or do not belong to this booth' });
    }

    // Build order items with product snapshots
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: parseFloat(product.price) * item.quantity,
        productName: product.name,
        productImage: product.images[0] || null
      };
    });

    // Calculate totals
    const totals = calculateOrderTotals(orderItems);

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    let orderExists = await prisma.order.findUnique({ where: { orderNumber } });

    while (orderExists) {
      orderNumber = generateOrderNumber();
      orderExists = await prisma.order.findUnique({ where: { orderNumber } });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user.id,
        boothId,
        shippingAddress,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
        paymentMethod,
        paymentProof,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        booth: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // Save shipping address if requested
    if (saveShippingAddress) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { shippingAddress }
      });
    }

    // Send confirmation email
    try {
      await sendOrderConfirmation(order, req.user);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      details: error.message
    });
  }
}

export async function getOrders(req, res) {
  try {
    const { boothId, status, userId } = req.query;

    const where = {};

    // If user is not admin, filter by their data
    if (req.user.role === 'VISITOR') {
      where.userId = req.user.id;
    } else if (req.user.role === 'EXHIBITOR') {
      // Find booths where user is a member
      const booths = await prisma.booth.findMany({
        where: {
          members: {
            some: {
              userId: req.user.id
            }
          }
        },
        select: { id: true }
      });

      if (booths.length > 0) {
        where.boothId = { in: booths.map(b => b.id) };
      }
    }

    // Admin can filter by any booth or user
    if (req.user.role === 'ADMIN') {
      if (boothId) where.boothId = boothId;
      if (userId) where.userId = userId;
    }

    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        booth: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        booth: {
          select: {
            id: true,
            name: true,
            logo: true,
            yapeNumber: true,
            yapeQR: true,
            plinNumber: true,
            plinQR: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify access
    const booth = await prisma.booth.findUnique({
      where: { id: order.boothId },
      include: {
        members: {
          where: { userId: req.user.id }
        }
      }
    });

    const isMember = booth && booth.members.length > 0;
    const hasAccess =
      req.user.role === 'ADMIN' ||
      order.userId === req.user.id ||
      isMember;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Verify order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        booth: {
          include: {
            members: {
              where: { userId: req.user.id }
            }
          }
        },
        user: true
      }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user is a booth member (OWNER/OPERATOR) or is admin
    const membership = existingOrder.booth.members[0];
    const canUpdate = req.user.role === 'ADMIN' ||
                      (membership && (membership.role === 'OWNER' || membership.role === 'OPERATOR'));

    if (!canUpdate) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    // Update timestamps based on status
    const updateData = {
      status,
      ...(notes && { notes })
    };

    if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    } else if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        booth: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Send status update email
    try {
      await sendOrderStatusUpdate(order, order.user, status);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

export async function getMyOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        },
        booth: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
}
