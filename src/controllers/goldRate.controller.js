const goldRateService = require('../services/goldRate.service');
const { clearCache } = require('../middlewares/cache.middleware');

/**
 * GET /gold-rate
 * Returns { rate: <22k value>, rates: { '24k': ..., '22k': ..., ... } }
 */
const getGoldRate = async (req, res, next) => {
  try {
    const goldRate = await goldRateService.getGoldRate();
    if (!goldRate) {
      return res.status(404).json({ success: false, message: 'Gold rate not set yet' });
    }
    res.status(200).json({ success: true, data: goldRate });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /gold-rate
 * Body: { rates: { '22k': 152000, '18k': 125000, ... } }
 *   OR legacy: { rate: 152000 } (treated as 22k update)
 */
const updateGoldRate = async (req, res, next) => {
  try {
    let result;
    if (req.body.rates && typeof req.body.rates === 'object') {
      // New multi-karat bulk update
      result = await goldRateService.bulkUpdateGoldRates(req.body.rates);
    } else {
      // Legacy single-rate update — default to 22k for backward compatibility
      const karat = req.body.karat || '22k';
      const rate = req.body.rate;
      await goldRateService.updateGoldRate(karat, rate);
      result = await goldRateService.getGoldRate();
    }
    await clearCache('gold-rate*');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getGoldRateHistory = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const history = await goldRateService.getGoldRateHistory(days);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoldRate,
  updateGoldRate,
  getGoldRateHistory,
};
