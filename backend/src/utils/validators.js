import JoiPkg from 'joi';
const Joi = JoiPkg.default || JoiPkg;

// Auth Validators
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  phone: Joi.string().pattern(/^9\d{8}$/).optional(),
  role: Joi.string().valid('VISITOR', 'EXHIBITOR').default('VISITOR')
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Event Validators
export const createEventSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  coverImage: Joi.string().uri().optional(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  status: Joi.string().valid('DRAFT', 'SCHEDULED', 'LIVE', 'ENDED').default('DRAFT')
});

export const updateEventSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  description: Joi.string().min(10).optional(),
  coverImage: Joi.string().uri().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  status: Joi.string().valid('DRAFT', 'SCHEDULED', 'LIVE', 'ENDED').optional(),
  isLive: Joi.boolean().optional()
});

// Booth Validators
export const createBoothSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  logo: Joi.string().uri().optional(),
  coverPhoto: Joi.string().uri().optional(),
  yapeNumber: Joi.string().pattern(/^9\d{8}$/).optional(),
  yapeQR: Joi.string().uri().optional(),
  plinNumber: Joi.string().pattern(/^9\d{8}$/).optional(),
  plinQR: Joi.string().uri().optional(),
  userId: Joi.string().uuid().required(),
  eventId: Joi.string().uuid().required()
});

export const updateBoothSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  description: Joi.string().min(10).optional(),
  logo: Joi.string().uri().optional(),
  coverPhoto: Joi.string().uri().optional(),
  yapeNumber: Joi.string().pattern(/^9\d{8}$/).optional(),
  yapeQR: Joi.string().uri().optional(),
  plinNumber: Joi.string().pattern(/^9\d{8}$/).optional(),
  plinQR: Joi.string().uri().optional(),
  isStreaming: Joi.boolean().optional()
});

// Product Validators
export const createProductSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).required(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  category: Joi.string().optional(),
  isActive: Joi.boolean().default(true),
  boothId: Joi.string().uuid().required()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  description: Joi.string().min(10).optional(),
  price: Joi.number().positive().precision(2).optional(),
  stock: Joi.number().integer().min(0).optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).optional(),
  category: Joi.string().optional(),
  isActive: Joi.boolean().optional()
});

// Order Validators
export const createOrderSchema = Joi.object({
  boothId: Joi.string().uuid().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  shippingAddress: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().pattern(/^9\d{8}$/).required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    district: Joi.string().required(),
    reference: Joi.string().optional()
  }).required(),
  paymentMethod: Joi.string().valid('yape', 'plin', 'other').required(),
  paymentProof: Joi.string().uri().optional(),
  saveShippingAddress: Joi.boolean().default(false)
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED').required(),
  notes: Joi.string().optional()
});

// Message Validators
export const createMessageSchema = Joi.object({
  boothId: Joi.string().uuid().required(),
  content: Joi.string().min(1).max(500).required()
});
