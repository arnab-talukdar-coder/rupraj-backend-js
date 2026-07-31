const prisma = require('../config/db');

const createCategory = async (data) => {
  return await prisma.category.create({
    data
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
    if (cat.parentId) {
      if (categoryMap[cat.parentId]) {
        categoryMap[cat.parentId].children.push(categoryMap[cat.id]);
      }
    } else {
      rootCategories.push(categoryMap[cat.id]);
    }
  });

  return rootCategories;
};

module.exports = {
  createCategory,
  getCategories
};
