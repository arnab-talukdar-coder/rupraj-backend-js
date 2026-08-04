const { z } = require('zod');

// Multi-rate & legacy update schema
const updateGoldRateSchema = z.object({
  // Multi-rate payload: { rates: { '22k': 152000, 'silver': 951, ... } }
  rates: z.record(
    z.string(),
    z.union([z.number(), z.string()]).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val > 0, {
      message: 'Each rate must be a positive number'
    })
  ).optional(),

  // Legacy single-rate payload: { rate: 152000 }
  rate: z.union([z.number(), z.string()]).transform(val => parseFloat(val)).refine(val => !isNaN(val) && val > 0, {
    message: 'Gold rate must be a positive number'
  }).optional(),

  // Optional karat when using legacy mode
  karat: z.string().optional(),
}).refine(
  (data) => data.rates !== undefined || data.rate !== undefined,
  { message: 'Either "rates" (object) or "rate" (number) must be provided' }
);

module.exports = {
  updateGoldRateSchema,
};
