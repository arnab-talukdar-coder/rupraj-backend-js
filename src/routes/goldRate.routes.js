const express = require('express');
const router = express.Router();

const goldRateController = require('../controllers/goldRate.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateGoldRateSchema } = require('../validations/goldRate.validation');
const { cacheMiddleware } = require('../middlewares/cache.middleware');

router.get('/', cacheMiddleware('gold-rate', 3600), goldRateController.getGoldRate);
router.get('/history', cacheMiddleware('gold-rate-history', 3600), goldRateController.getGoldRateHistory);
router.put('/', auth, role(['ADMIN']), validate(updateGoldRateSchema), goldRateController.updateGoldRate);

module.exports = router;
