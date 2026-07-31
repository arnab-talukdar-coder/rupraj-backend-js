const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateOrderStatusSchema } = require('../validations/order.validation');

router.use(auth);

// User routes
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getUserOrders);

// Admin routes
router.get('/', role(['ADMIN']), orderController.getAllOrders);
router.patch('/:id/status', role(['ADMIN']), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
