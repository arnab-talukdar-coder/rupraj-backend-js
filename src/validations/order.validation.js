const { z } = require('zod');

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

module.exports = {
  updateOrderStatusSchema
};
