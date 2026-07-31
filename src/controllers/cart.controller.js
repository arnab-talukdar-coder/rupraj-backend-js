const cartService = require('../services/cart.service');

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

const addCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const item = await cartService.addCartItem(req.user.id, productId, quantity);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const item = await cartService.updateCartItem(req.user.id, parseInt(req.params.id, 10), quantity);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    await cartService.removeCartItem(req.user.id, parseInt(req.params.id, 10));
    res.status(200).json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem
};
