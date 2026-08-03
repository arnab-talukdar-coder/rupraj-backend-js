const categoryService = require('../services/category.service');
const { clearCache } = require('../middlewares/cache.middleware');

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    await clearCache('categories:*');
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    await clearCache('categories:*');
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    await clearCache('categories:*');
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const { tree } = req.query;
    const categories = await categoryService.getCategories(tree !== 'false');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories
};

