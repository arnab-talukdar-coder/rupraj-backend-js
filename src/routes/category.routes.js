const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCategorySchema, updateCategorySchema } = require('../validations/category.validation');
const { cacheMiddleware } = require('../middlewares/cache.middleware');

router.get('/', cacheMiddleware('categories', 3600), categoryController.getCategories);
router.post('/', auth, role(['ADMIN']), validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', auth, role(['ADMIN']), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', auth, role(['ADMIN']), categoryController.deleteCategory);

module.exports = router;

