const wishlistService = require('../services/wishlist.service');

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.id);
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const item = await wishlistService.addToWishlist(req.user.id, productId);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body; // Using body for consistency with delete or could use param
    await wishlistService.removeFromWishlist(req.user.id, parseInt(req.params.productId, 10));
    res.status(200).json({ success: true, message: 'Item removed from wishlist' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
