import {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  IMAGE_TYPES,
  getImageUrl
} from '../services/cloudflare-images.service.js';

/**
 * Sube una imagen de avatar (usuario)
 * POST /api/upload/avatar
 */
export async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload an image file'
      });
    }

    const result = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      IMAGE_TYPES.AVATAR.type,
      {
        userId: req.user?.id,
        uploadedBy: req.user?.name
      }
    );

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      data: {
        id: result.id,
        url: result.url,
        urls: result.urls
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      error: 'Failed to upload avatar',
      message: error.message
    });
  }
}

/**
 * Sube un logo de expositor
 * POST /api/upload/logo
 */
export async function uploadLogo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload an image file'
      });
    }

    const result = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      IMAGE_TYPES.LOGO.type,
      {
        boothId: req.body.boothId,
        uploadedBy: req.user?.name
      }
    );

    res.status(200).json({
      message: 'Logo uploaded successfully',
      data: {
        id: result.id,
        url: result.url,
        urls: result.urls
      }
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      error: 'Failed to upload logo',
      message: error.message
    });
  }
}

/**
 * Sube una imagen de cover (evento o booth)
 * POST /api/upload/cover
 */
export async function uploadCover(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload an image file'
      });
    }

    const result = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      IMAGE_TYPES.COVER.type,
      {
        entityType: req.body.entityType, // 'event' o 'booth'
        entityId: req.body.entityId,
        uploadedBy: req.user?.name
      }
    );

    res.status(200).json({
      message: 'Cover image uploaded successfully',
      data: {
        id: result.id,
        url: result.url,
        urls: result.urls
      }
    });
  } catch (error) {
    console.error('Error uploading cover:', error);
    res.status(500).json({
      error: 'Failed to upload cover image',
      message: error.message
    });
  }
}

/**
 * Sube una imagen de producto
 * POST /api/upload/product
 */
export async function uploadProductImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload an image file'
      });
    }

    const result = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      IMAGE_TYPES.PRODUCT.type,
      {
        productId: req.body.productId,
        boothId: req.body.boothId,
        uploadedBy: req.user?.name
      }
    );

    res.status(200).json({
      message: 'Product image uploaded successfully',
      data: {
        id: result.id,
        url: result.url,
        urls: result.urls
      }
    });
  } catch (error) {
    console.error('Error uploading product image:', error);
    res.status(500).json({
      error: 'Failed to upload product image',
      message: error.message
    });
  }
}

/**
 * Sube múltiples imágenes de producto
 * POST /api/upload/products
 */
export async function uploadProductImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please upload at least one image file'
      });
    }

    const files = req.files.map(file => ({
      buffer: file.buffer,
      fileName: file.originalname
    }));

    const results = await uploadMultipleImages(files, IMAGE_TYPES.PRODUCT.type);

    res.status(200).json({
      message: `${results.length} product images uploaded successfully`,
      data: results.map(r => ({
        id: r.id,
        url: r.url,
        urls: r.urls
      }))
    });
  } catch (error) {
    console.error('Error uploading product images:', error);
    res.status(500).json({
      error: 'Failed to upload product images',
      message: error.message
    });
  }
}

/**
 * Sube un comprobante de pago
 * POST /api/upload/payment-proof
 */
export async function uploadPaymentProof(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a payment proof image'
      });
    }

    const result = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      IMAGE_TYPES.PAYMENT_PROOF.type,
      {
        orderId: req.body.orderId,
        uploadedBy: req.user?.name || req.body.userName
      }
    );

    res.status(200).json({
      message: 'Payment proof uploaded successfully',
      data: {
        id: result.id,
        url: result.url,
        urls: result.urls
      }
    });
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    res.status(500).json({
      error: 'Failed to upload payment proof',
      message: error.message
    });
  }
}

/**
 * Elimina una imagen
 * DELETE /api/upload/:imageId
 */
export async function deleteUploadedImage(req, res) {
  try {
    const { imageId } = req.params;

    await deleteImage(imageId);

    res.status(200).json({
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      error: 'Failed to delete image',
      message: error.message
    });
  }
}

/**
 * Obtiene la URL de una imagen con un variant específico
 * GET /api/upload/url/:imageId/:variant
 */
export async function getImageUrlByVariant(req, res) {
  try {
    const { imageId, variant } = req.params;

    const url = getImageUrl(imageId, variant);

    res.status(200).json({
      data: { url }
    });
  } catch (error) {
    console.error('Error getting image URL:', error);
    res.status(500).json({
      error: 'Failed to get image URL',
      message: error.message
    });
  }
}
