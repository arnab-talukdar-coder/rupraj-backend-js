const prisma = require('../config/db');

const createCategory = async (data) => {
  return await prisma.category.create({
    data
  });
};

const updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: { id: parseInt(id, 10) },
    data
  });
};

const deleteCategory = async (id) => {
  const catId = parseInt(id, 10);
  
  // Check if products exist for this category
  const productCount = await prisma.product.count({
    where: { categoryId: catId }
  });
  if (productCount > 0) {
    const err = new Error(`Cannot delete category because ${productCount} product(s) are assigned to it.`);
    err.status = 400;
    throw err;
  }

  // Check if subcategories exist
  const childCount = await prisma.category.count({
    where: { parentId: catId }
  });
  if (childCount > 0) {
    const err = new Error(`Cannot delete category because ${childCount} subcategory(ies) belong to it.`);
    err.status = 400;
    throw err;
  }

  return await prisma.category.delete({
    where: { id: catId }
  });
};

const getCategories = async (tree = true) => {
  const allCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  if (!tree) {
    return allCategories;
  }

  // Build the tree in memory
  const categoryMap = {};
  allCategories.forEach(cat => {
    categoryMap[cat.id] = { ...cat, children: [] };
  });

  const rootCategories = [];
  allCategories.forEach(cat => {
    if (cat.parentId && categoryMap[cat.parentId]) {
      categoryMap[cat.parentId].children.push(categoryMap[cat.id]);
    } else {
      rootCategories.push(categoryMap[cat.id]);
    }
  });

  return rootCategories;
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories
};

