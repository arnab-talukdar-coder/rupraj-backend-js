const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  parentId: z.number().int().optional().nullable(),
});

module.exports = {
  createCategorySchema,
};
