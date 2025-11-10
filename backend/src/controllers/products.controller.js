import prisma from '../config/prisma.js';

export async function createProduct(req, res) {
  try {
    const productData = req.body;

    // Verify booth exists
    const booth = await prisma.booth.findUnique({
      where: { id: productData.boothId }
    });

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    // Verify user owns the booth or is admin
    if (req.user.role !== 'ADMIN' && booth.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to add products to this booth' });
    }

    const product = await prisma.product.create({
      data: productData
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

export async function getProducts(req, res) {
  try {
    const { boothId, category, isActive, search } = req.query;

    const where = {};
    if (boothId) where.boothId = boothId;
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        booth: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    });

    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
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

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { booth: true }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Verify user owns the booth or is admin
    if (req.user.role !== 'ADMIN' && existingProduct.booth.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: updates
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    // Verify product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { booth: true }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Verify user owns the booth or is admin
    if (req.user.role !== 'ADMIN' && existingProduct.booth.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

export async function getProductsByBooth(req, res) {
  try {
    const { boothId } = req.params;
    const { isActive = 'true' } = req.query;

    const products = await prisma.product.findMany({
      where: {
        boothId,
        ...(isActive !== 'all' && { isActive: isActive === 'true' })
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ products });
  } catch (error) {
    console.error('Get products by booth error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
}
