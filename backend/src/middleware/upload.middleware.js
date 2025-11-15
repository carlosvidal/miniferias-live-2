import multer from 'multer';
import { isValidImage, isValidImageSize } from '../services/cloudflare-images.service.js';

// Configurar multer para usar memoria (buffer)
const storage = multer.memoryStorage();

// Filtro de archivos - solo imágenes
const fileFilter = (req, file, cb) => {
  if (!isValidImage(file)) {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.'), false);
    return;
  }
  cb(null, true);
};

// Límite de tamaño - 10MB
const limits = {
  fileSize: 10 * 1024 * 1024 // 10MB
};

// Configuración base de multer
const upload = multer({
  storage,
  fileFilter,
  limits
});

/**
 * Middleware para subir una sola imagen
 * @param {string} fieldName - Nombre del campo en el form
 */
export const uploadSingle = (fieldName = 'image') => {
  return upload.single(fieldName);
};

/**
 * Middleware para subir múltiples imágenes
 * @param {string} fieldName - Nombre del campo en el form
 * @param {number} maxCount - Número máximo de archivos (default: 5)
 */
export const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Middleware para manejar múltiples campos con imágenes
 * Ejemplo: uploadFields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }])
 */
export const uploadFields = (fields) => {
  return upload.fields(fields);
};

/**
 * Middleware de error handler para multer
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error de multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Image size must not exceed 10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum number of files exceeded'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field',
        message: 'Unexpected file field name'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  } else if (err) {
    // Otros errores (como fileFilter)
    return res.status(400).json({
      error: 'Invalid file',
      message: err.message
    });
  }
  next();
};

/**
 * Middleware de validación adicional para verificar que se subió un archivo
 */
export const requireFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      error: 'No file uploaded',
      message: 'Please upload an image file'
    });
  }
  next();
};
