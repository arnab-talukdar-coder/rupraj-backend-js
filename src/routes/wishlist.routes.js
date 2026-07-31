const express = require('express');
const router = express.Router();

const wishlistController = require('../controllers/wishlist.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { addToWishlistSchema } = require('../validations/wishlist.validation');

router.use(auth); // All wishlist routes require auth

router.get('/', wishlistController.getWishlist);
router.post('/', validate(addToWishlistSchema), wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;
