const addressService = require('../services/address.service');

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.getAddresses(req.user.id);
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(req.user.id, req.body);
    res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await addressService.updateAddress(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    await addressService.deleteAddress(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await addressService.setDefaultAddress(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
