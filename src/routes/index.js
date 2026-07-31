const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const goldRateRoutes = require('./goldRate.routes');
const addressRoutes = require('./address.routes');
const wishlistRoutes = require('./wishlist.routes');
const reviewRoutes = require('./review.routes');

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/gold-rate', goldRateRoutes);
router.use('/addresses', addressRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;
