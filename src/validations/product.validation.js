const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  purity: z.string().optional(),
  metalType: z.string().optional(),
  metalColor: z.string().optional(),
  diamondWeight: z.coerce.number().optional(),
  diamondColor: z.string().optional(),
  diamondClarity: z.string().optional(),
  basePrice: z.coerce.number().optional(),
  weight: z.coerce.number().min(0, 'Weight must be a positive number'),
  makingCharges: z.coerce.number().min(0, 'Making charges must be a positive number'),
  goldRate: z.coerce.number().optional(),
  images: z.array(z.string().url('Must be a valid URL')).optional(),
  stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer'),
  categoryId: z.coerce.number().int().positive('Valid category ID is required'),
});

const updateProductSchema = createProductSchema.partial();

module.exports = {
  createProductSchema,
  updateProductSchema,
};
