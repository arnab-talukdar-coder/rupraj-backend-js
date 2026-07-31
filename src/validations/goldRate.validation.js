const { z } = require('zod');

const VALID_KARATS = ['24k', '22k', '18k', '14k', '9k'];

// Legacy single-rate update schema
const updateGoldRateSchema = z.object({
  // Multi-karat payload: { rates: { '22k': 152000, ... } }
  rates: z.record(
    z.enum(['24k', '22k', '18k', '14k', '9k']),
    z.number().positive('Each karat rate must be a positive number')
  ).optional(),

  // Legacy single-rate payload: { rate: 152000 }
  rate: z.number().positive('Gold rate must be a positive number').optional(),

  // Optional karat when using legacy mode (defaults to 22k in controller)
  karat: z.enum(['24k', '22k', '18k', '14k', '9k']).optional(),
}).refine(
  (data) => data.rates !== undefined || data.rate !== undefined,
  { message: 'Either "rates" (object) or "rate" (number) must be provided' }
);

module.exports = {
  updateGoldRateSchema,
  VALID_KARATS,
};
