const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCategorySchema } = require('../validations/category.validation');
const { cacheMiddleware } = require('../middlewares/cache.middleware');

router.get('/', cacheMiddleware('categories', 3600), categoryController.getCategories);
router.post('/', auth, role(['ADMIN']), validate(createCategorySchema), categoryController.createCategory);

module.exports = router;
