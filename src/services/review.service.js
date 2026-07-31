const prisma = require('../config/db');

const createReview = async (userId, productId, rating, comment) => {
  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('Product not found');

  // Check if user already reviewed
  const existingReview = await prisma.review.findFirst({
    where: { userId, productId }
  });

  if (existingReview) {
    return await prisma.review.update({
      where: { id: existingReview.id },
      data: { rating, comment }
    });
  }

  return await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment
    }
  });
};

const getProductReviews = async (productId) => {
  return await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: { id: true, name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const deleteReview = async (id, userId) => {
  const review = await prisma.review.findFirst({
    where: { id: parseInt(id, 10), userId }
  });

  if (!review) throw new Error('Review not found or unauthorized');

  return await prisma.review.delete({
    where: { id: parseInt(id, 10) }
  });
};

module.exports = {
  createReview,
  getProductReviews,
  deleteReview
};
