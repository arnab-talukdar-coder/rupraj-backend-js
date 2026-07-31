const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cart.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { addCartItemSchema, updateCartItemSchema } = require('../validations/cart.validation');

router.use(auth); // All cart routes require auth

router.get('/', cartController.getCart);
router.post('/', validate(addCartItemSchema), cartController.addCartItem);
router.put('/:id', validate(updateCartItemSchema), cartController.updateCartItem);
router.delete('/:id', cartController.removeCartItem);

module.exports = router;
