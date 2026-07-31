const { z } = require('zod');

const addCartItemSchema = z.object({
  productId: z.number().int().positive('Valid product ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1').default(1),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

module.exports = {
  addCartItemSchema,
  updateCartItemSchema,
};
