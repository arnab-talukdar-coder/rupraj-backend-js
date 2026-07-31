const productService = require('../services/product.service');
const { clearCache } = require('../middlewares/cache.middleware');

const createProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.files && req.files.length > 0) {
      payload.images = req.files.map(file => file.path);
    } else {
      return res.status(400).json({ success: false, message: 'At least one image is required' });
    }

    const product = await productService.createProduct(payload);
    await clearCache('products:*');
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { categoryId, page, limit, search, minWeight, maxWeight, sortBy, cursor, tag } = req.query;
    const result = await productService.getProducts(
      { categoryId, search, minWeight, maxWeight, sortBy, cursor, tag },
      { page, limit }
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { q, limit } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    const products = await productService.searchProducts(q, limit);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.files && req.files.length > 0) {
      payload.images = req.files.map(file => file.path);
    }
    
    const product = await productService.updateProduct(req.params.id, payload);
    await clearCache('products:*');
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    await clearCache('products:*');
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
