const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/review.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createReviewSchema } = require('../validations/review.validation');

router.get('/product/:productId', reviewController.getProductReviews);

router.post('/', auth, validate(createReviewSchema), reviewController.createReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
