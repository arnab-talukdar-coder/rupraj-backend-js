const orderService = require('../services/order.service');

const createOrder = async (req, res, next) => {
  try {
    const { addressId } = req.body;
    const result = await orderService.createOrderFromCart(req.user.id, addressId ? parseInt(addressId, 10) : undefined);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(parseInt(req.params.id, 10), status);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
};
