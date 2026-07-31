const prisma = require('../config/db');

const GST_RATE = 0.03; // 3% GST for jewellery

const calculateFinalPrice = (product) => {
  let subtotal = 0;
  if (product.basePrice != null) {
    subtotal = product.basePrice;
  } else if (product.goldRate != null && product.weight != null && product.makingCharges != null) {
    let makingChargeAmount = product.makingCharges;
    if (product.makingChargeType === 'PERCENTAGE') {
      makingChargeAmount = ((product.goldRate * product.weight) * product.makingCharges) / 100;
    }
    subtotal = (product.goldRate * product.weight) + makingChargeAmount;
  }
  
// Final price includes GST
  return subtotal > 0 ? subtotal * (1 + GST_RATE) : 0;
};

const getCategoryIdsRecursive = async (categoryId) => {
  const ids = [categoryId];
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true }
  });

  for (const child of children) {
    const childIds = await getCategoryIdsRecursive(child.id);
    ids.push(...childIds);
  }
  return ids;
};

const parseProductData = (data) => {
  const parsedData = { ...data };
  
  if (parsedData.weight != null) parsedData.weight = parseFloat(parsedData.weight);
  if (parsedData.makingCharges != null) parsedData.makingCharges = parseFloat(parsedData.makingCharges);
  if (parsedData.stock != null) parsedData.stock = parseInt(parsedData.stock, 10);
  if (parsedData.categoryId != null) parsedData.categoryId = parseInt(parsedData.categoryId, 10);
  if (parsedData.diamondWeight != null) parsedData.diamondWeight = parseFloat(parsedData.diamondWeight);
  if (parsedData.basePrice != null) parsedData.basePrice = parseFloat(parsedData.basePrice);
  if (parsedData.goldRate != null) parsedData.goldRate = parseFloat(parsedData.goldRate);
  
  if (parsedData.makingChargeType) {
    parsedData.makingChargeType = parsedData.makingChargeType.toUpperCase();
  }

  // If tags come as a JSON string (e.g. from FormData), parse it
  if (typeof parsedData.tags === 'string') {
    try {
      parsedData.tags = JSON.parse(parsedData.tags);
    } catch {
      parsedData.tags = [parsedData.tags]; // Fallback to single string array
    }
  }

  return parsedData;
};

const createProduct = async (data) => {
  const parsedData = parseProductData(data);
  return await prisma.product.create({ data: parsedData });
};

const getProducts = async (filters, pagination) => {
  const { categoryId, search, minWeight, maxWeight, sortBy, cursor, tag } = filters;
  const { page = 1, limit = 10 } = pagination;
  
  const where = {};
  
  if (categoryId) {
    const categoryIds = await getCategoryIdsRecursive(parseInt(categoryId, 10));
    where.categoryId = { in: categoryIds };
  }
  
  if (tag) {
    where.tags = { has: tag };
  }

  if (search) {
    // Basic search fallback if not using the dedicated search endpoint
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (minWeight || maxWeight) {
    where.weight = {};
    if (minWeight) where.weight.gte = parseFloat(minWeight);
    if (maxWeight) where.weight.lte = parseFloat(maxWeight);
  }

  let orderBy = { createdAt: 'desc' };
  if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
  if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
  if (sortBy === 'weight_asc') orderBy = { weight: 'asc' };
  if (sortBy === 'weight_desc') orderBy = { weight: 'desc' };
  if (sortBy === 'price_asc') orderBy = { basePrice: 'asc' };
  if (sortBy === 'price_desc') orderBy = { basePrice: 'desc' };

  // Optimized pagination: Use cursor if provided, otherwise fallback to offset
  const queryOptions = {
    where,
    take: parseInt(limit, 10),
    include: { category: true },
    orderBy
  };

  if (cursor) {
    queryOptions.cursor = { id: parseInt(cursor, 10) };
    queryOptions.skip = 1; // Skip the cursor itself
  } else {
    queryOptions.skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  }

  const products = await prisma.product.findMany(queryOptions);
  const total = await prisma.product.count({ where });

  const productsWithPrice = products.map(product => ({
    ...product,
    finalPrice: calculateFinalPrice(product)
  }));

  return {
    data: productsWithPrice,
    meta: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
      nextCursor: products.length === parseInt(limit, 10) ? products[products.length - 1].id : null
    }
  };
};

const searchProducts = async (query, limit = 10) => {
  // Using PostgreSQL Full-Text Search
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { search: query.split(' ').join(' & ') } },
        { description: { search: query.split(' ').join(' & ') } }
      ]
    },
    take: parseInt(limit, 10),
    include: { category: true }
  });

  return products.map(product => ({
    ...product,
    finalPrice: calculateFinalPrice(product)
  }));
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id, 10) },
    include: { category: true }
  });

  if (product) {
    product.finalPrice = calculateFinalPrice(product);
  }
  return product;
};

const updateProduct = async (id, data) => {
  const parsedData = parseProductData(data);
  return await prisma.product.update({
    where: { id: parseInt(id, 10) },
    data: parsedData
  });
};

const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id: parseInt(id, 10) }
  });
};

module.exports = {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  calculateFinalPrice
};
