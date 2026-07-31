const reviewService = require('../services/review.service');

const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const review = await reviewService.createReview(req.user.id, parseInt(productId, 10), rating, comment);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getProductReviews(parseInt(req.params.productId, 10));
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  deleteReview
};
