const { z } = require('zod');

const addToWishlistSchema = z.object({
  productId: z.coerce.number().int().positive('Product ID is required')
});

module.exports = {
  addToWishlistSchema
};
