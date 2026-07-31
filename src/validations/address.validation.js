const { z } = require('zod');

const createAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('India'),
  isDefault: z.coerce.boolean().optional()
});

const updateAddressSchema = createAddressSchema.partial();

module.exports = {
  createAddressSchema,
  updateAddressSchema
};
