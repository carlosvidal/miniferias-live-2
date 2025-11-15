// Node.js 18+ tiene fetch y FormData nativos, no necesitamos imports

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_IMAGES_ACCOUNT_HASH = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH;

const CLOUDFLARE_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;

/**
 * Tipos de imágenes y sus configuraciones de crop
 */
export const IMAGE_TYPES = {
  AVATAR: {
    type: 'avatar',
    aspectRatio: '1:1',
    variant: 'avatar',
    description: 'Profile picture (usuarios) - cuadrada, mostrar circular'
  },
  LOGO: {
    type: 'logo',
    aspectRatio: '1:1',
    variant: 'logo',
    description: 'Logo de expositor - cuadrada'
  },
  COVER: {
    type: 'cover',
    aspectRatio: '16:9',
    variant: 'cover',
    description: 'Cover image (eventos, booths) - rectangular 16:9'
  },
  PRODUCT: {
    type: 'product',
    aspectRatio: '1:1',
    variant: 'product',
    description: 'Product image - cuadrada'
  },
  PAYMENT_PROOF: {
    type: 'payment',
    aspectRatio: 'original',
    variant: 'public',
    description: 'Payment proof - original ratio'
  }
};

/**
 * Sube una imagen a Cloudflare Images con crop automático
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @param {string} fileName - Nombre del archivo
 * @param {string} imageType - Tipo de imagen (usar IMAGE_TYPES)
 * @param {Object} metadata - Metadata adicional (opcional)
 * @returns {Promise<Object>} - Objeto con URLs de la imagen
 */
export async function uploadImage(fileBuffer, fileName, imageType = IMAGE_TYPES.AVATAR.type, metadata = {}) {
  try {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      throw new Error('Cloudflare credentials not configured');
    }

    // Crear FormData para el upload
    const formData = new FormData();
    formData.append('file', fileBuffer, fileName);

    // Agregar metadata
    const imageConfig = Object.values(IMAGE_TYPES).find(t => t.type === imageType) || IMAGE_TYPES.AVATAR;
    const fullMetadata = {
      type: imageType,
      aspectRatio: imageConfig.aspectRatio,
      uploadedAt: new Date().toISOString(),
      ...metadata
    };

    formData.append('metadata', JSON.stringify(fullMetadata));

    // Configurar requireSignedURLs si es necesario (false para URLs públicas)
    formData.append('requireSignedURLs', 'false');

    // Hacer el request a Cloudflare
    const response = await fetch(CLOUDFLARE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: formData
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.errors?.[0]?.message || 'Failed to upload image to Cloudflare');
    }

    const imageId = result.result.id;
    const variantName = imageConfig.variant;

    // Retornar URLs para diferentes variants
    return {
      id: imageId,
      url: getImageUrl(imageId, variantName),
      urls: {
        public: getImageUrl(imageId, 'public'),
        avatar: getImageUrl(imageId, 'avatar'),
        logo: getImageUrl(imageId, 'logo'),
        product: getImageUrl(imageId, 'product'),
        cover: getImageUrl(imageId, 'cover'),
        thumbnail: getImageUrl(imageId, 'thumbnail')
      },
      metadata: fullMetadata,
      uploadedAt: result.result.uploaded
    };
  } catch (error) {
    console.error('Error uploading image to Cloudflare:', error);
    throw error;
  }
}

/**
 * Sube múltiples imágenes a Cloudflare
 * @param {Array<{buffer: Buffer, fileName: string}>} files - Array de archivos
 * @param {string} imageType - Tipo de imagen
 * @returns {Promise<Array>} - Array de URLs
 */
export async function uploadMultipleImages(files, imageType = IMAGE_TYPES.PRODUCT.type) {
  try {
    const uploadPromises = files.map(file =>
      uploadImage(file.buffer, file.fileName, imageType)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

/**
 * Elimina una imagen de Cloudflare Images
 * @param {string} imageIdOrUrl - ID de la imagen o URL completa
 * @returns {Promise<boolean>}
 */
export async function deleteImage(imageIdOrUrl) {
  try {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      throw new Error('Cloudflare credentials not configured');
    }

    // Extraer el ID de la imagen de la URL si es necesario
    const imageId = extractImageId(imageIdOrUrl);

    const response = await fetch(`${CLOUDFLARE_API_URL}/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      }
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.errors?.[0]?.message || 'Failed to delete image from Cloudflare');
    }

    return true;
  } catch (error) {
    console.error('Error deleting image from Cloudflare:', error);
    throw error;
  }
}

/**
 * Obtiene la URL de una imagen con un variant específico
 * @param {string} imageId - ID de la imagen
 * @param {string} variant - Nombre del variant (avatar, logo, product, cover, thumbnail, public)
 * @returns {string} - URL de la imagen
 */
export function getImageUrl(imageId, variant = 'public') {
  if (!CLOUDFLARE_IMAGES_ACCOUNT_HASH) {
    throw new Error('CLOUDFLARE_IMAGES_ACCOUNT_HASH not configured');
  }
  return `https://imagedelivery.net/${CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${imageId}/${variant}`;
}

/**
 * Extrae el ID de la imagen de una URL de Cloudflare Images
 * @param {string} urlOrId - URL completa o ID
 * @returns {string} - ID de la imagen
 */
export function extractImageId(urlOrId) {
  // Si ya es un ID (UUID), retornarlo
  if (!urlOrId.includes('/')) {
    return urlOrId;
  }

  // Extraer de URL: https://imagedelivery.net/{hash}/{id}/{variant}
  const matches = urlOrId.match(/imagedelivery\.net\/[^\/]+\/([^\/]+)/);
  if (matches && matches[1]) {
    return matches[1];
  }

  throw new Error('Invalid Cloudflare Images URL or ID');
}

/**
 * Obtiene información de una imagen
 * @param {string} imageId - ID de la imagen
 * @returns {Promise<Object>}
 */
export async function getImageDetails(imageId) {
  try {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      throw new Error('Cloudflare credentials not configured');
    }

    const response = await fetch(`${CLOUDFLARE_API_URL}/${imageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      }
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.errors?.[0]?.message || 'Failed to get image details');
    }

    return result.result;
  } catch (error) {
    console.error('Error getting image details:', error);
    throw error;
  }
}

/**
 * Valida que un archivo sea una imagen válida
 * @param {Object} file - Archivo de multer
 * @returns {boolean}
 */
export function isValidImage(file) {
  const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validMimeTypes.includes(file.mimetype);
}

/**
 * Valida el tamaño de la imagen (máximo 10MB)
 * @param {Object} file - Archivo de multer
 * @returns {boolean}
 */
export function isValidImageSize(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSize;
}
