const prisma = require('../config/db');

const DEFAULT_RATES = [
  { karat: '24k', rate: 75000 },
  { karat: '22k', rate: 68750 },
  { karat: '18k', rate: 56250 },
  { karat: '14k', rate: 43750 },
  { karat: '9k',  rate: 28125 },
];

/**
 * Ensure default karat records exist in the DB.
 */
const seedDefaultRates = async () => {
  for (const { karat, rate } of DEFAULT_RATES) {
    await prisma.goldRate.upsert({
      where: { karat },
      update: {},
      create: { karat, rate },
    });
  }
};

/**
 * Get all karat rates as { rate (22k value), rates: { karat -> rate } }
 */
const getGoldRate = async () => {
  let records = await prisma.goldRate.findMany({ orderBy: { karat: 'asc' } });

  // Self-seed if empty
  if (!records || records.length === 0) {
    await seedDefaultRates();
    records = await prisma.goldRate.findMany({ orderBy: { karat: 'asc' } });
  }

  const rates = {};
  for (const r of records) {
    rates[r.karat] = r.rate;
  }

  // Legacy compatibility: return 22k rate as the top-level "rate" field
  const legacyRate = rates['22k'] ?? Object.values(rates)[0] ?? 0;

  return { rate: legacyRate, rates };
};

/**
 * Update a single karat rate.
 */
const updateGoldRate = async (karat, rate) => {
  const parsedRate = parseFloat(rate);
  return await prisma.goldRate.upsert({
    where: { karat },
    update: { rate: parsedRate },
    create: { karat, rate: parsedRate },
  });
};

/**
 * Bulk upsert multiple karat rates at once.
 * @param {Object} rates - e.g. { '22k': 152000, '18k': 125000, ... }
 */
const bulkUpdateGoldRates = async (rates) => {
  const promises = Object.entries(rates).map(([karat, rate]) =>
    prisma.goldRate.upsert({
      where: { karat },
      update: { rate: parseFloat(rate) },
      create: { karat, rate: parseFloat(rate) },
    })
  );
  await Promise.all(promises);
  return getGoldRate();
};

/**
 * Get gold rate history for a specific number of days.
 */
const getGoldRateHistory = async (days = 30) => {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  
  const records = await prisma.goldRateHistory.findMany({
    where: {
      date: { gte: fromDate }
    },
    orderBy: { date: 'asc' }
  });

  return records;
};

module.exports = {
  getGoldRate,
  updateGoldRate,
  bulkUpdateGoldRates,
  seedDefaultRates,
  getGoldRateHistory,
};
