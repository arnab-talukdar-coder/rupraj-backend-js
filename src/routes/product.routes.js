const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const { createProductSchema, updateProductSchema } = require('../validations/product.validation');
const { cacheMiddleware } = require('../middlewares/cache.middleware');

router.get('/', cacheMiddleware('products', 1800), productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

// Admin only routes
router.post('/', auth, role(['ADMIN']), upload.array('images', 5), validate(createProductSchema), productController.createProduct);
router.put('/:id', auth, role(['ADMIN']), upload.array('images', 5), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', auth, role(['ADMIN']), productController.deleteProduct);

module.exports = router;
