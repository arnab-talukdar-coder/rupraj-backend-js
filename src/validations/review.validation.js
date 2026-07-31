const { z } = require('zod');

const createReviewSchema = z.object({
  productId: z.coerce.number().int().positive('Product ID is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

module.exports = {
  createReviewSchema
};
