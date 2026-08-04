const prisma = require('../config/db');

const DEFAULT_RATES = [
  { karat: '24k', rate: 75000 },
  { karat: '22k', rate: 68750 },
  { karat: '18k', rate: 56250 },
  { karat: '14k', rate: 43750 },
  { karat: '9k',  rate: 28125 },
  { karat: 'silver', rate: 950 },
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
  // Ensure default karat & metal records (including silver) exist in DB
  await seedDefaultRates();

  const records = await prisma.goldRate.findMany({ orderBy: { karat: 'asc' } });

  const rates = {};
  for (const r of records) {
    rates[r.karat] = r.rate;
  }

  // Legacy compatibility: return 22k rate as the top-level "rate" field
  const legacyRate = rates['22k'] ?? Object.values(rates)[0] ?? 0;

  return { rate: legacyRate, rates };
};

/**
 * Record today's history entry for a given karat and rate
 */
const recordHistory = async (karat, rate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Standardize karat display format if needed (e.g., '22k' -> '22 Karat')
  const karatNameMap = {
    '9k': '9 Karat',
    '14k': '14 Karat',
    '18k': '18 Karat',
    '22k': '22 Karat',
    '24k': '24 Karat',
    'silver': 'Silver'
  };
  const normalizedKarat = karatNameMap[karat.toLowerCase().trim()] || karat;

  await prisma.goldRateHistory.upsert({
    where: {
      karat_date: {
        karat: normalizedKarat,
        date: today
      }
    },
    update: { rate: parseFloat(rate) },
    create: {
      karat: normalizedKarat,
      rate: parseFloat(rate),
      date: today
    }
  });
};

/**
 * Update a single karat rate.
 */
const updateGoldRate = async (karat, rate) => {
  const parsedRate = parseFloat(rate);
  const updated = await prisma.goldRate.upsert({
    where: { karat },
    update: { rate: parsedRate },
    create: { karat, rate: parsedRate },
  });
  await recordHistory(karat, parsedRate);
  return updated;
};

/**
 * Bulk upsert multiple karat rates at once.
 * @param {Object} rates - e.g. { '22k': 152000, '18k': 125000, ... }
 */
const bulkUpdateGoldRates = async (rates) => {
  const promises = Object.entries(rates).map(async ([karat, rate]) => {
    const floatRate = parseFloat(rate);
    await prisma.goldRate.upsert({
      where: { karat },
      update: { rate: floatRate },
      create: { karat, rate: floatRate },
    });
    await recordHistory(karat, floatRate);
  });
  await Promise.all(promises);
  return getGoldRate();
};

/**
 * Seed initial 30-day history if table is empty
 */
const seedHistoryIfEmpty = async () => {
  const count = await prisma.goldRateHistory.count();
  if (count > 0) return;

  const currentRatesData = await getGoldRate();
  const currentRates = currentRatesData.rates || {};

  const karats = ['9 Karat', '14 Karat', '18 Karat', '22 Karat', '24 Karat'];
  const baseRates = {
    '9 Karat': currentRates['9k'] || 6000,
    '14 Karat': currentRates['14k'] || 9000,
    '18 Karat': currentRates['18k'] || 11500,
    '22 Karat': currentRates['22k'] || 14200,
    '24 Karat': currentRates['24k'] || 15500
  };

  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    for (const karat of karats) {
      const fluctuation = Math.floor(Math.random() * 200) - 100;
      const trend = (30 - i) * 10;
      const rate = Math.round(baseRates[karat] + fluctuation + trend);

      await prisma.goldRateHistory.create({
        data: { karat, rate, date }
      });
    }
  }
};

/**
 * Get gold rate history for a specific number of days.
 */
const getGoldRateHistory = async (days = 30) => {
  await seedHistoryIfEmpty();

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  fromDate.setHours(0, 0, 0, 0);

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
