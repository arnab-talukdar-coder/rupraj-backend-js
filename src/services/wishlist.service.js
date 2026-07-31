const prisma = require('../config/db');

const getWishlist = async (userId) => {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: {
        items: { include: { product: true } }
      }
    });
  }
  return wishlist;
};

const addToWishlist = async (userId, productId) => {
  const wishlist = await getWishlist(userId);
  
  const existingItem = wishlist.items.find(item => item.productId === productId);
  if (existingItem) {
    return existingItem; // Already in wishlist
  }

  return await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId
    }
  });
};

const removeFromWishlist = async (userId, productId) => {
  const wishlist = await getWishlist(userId);
  const item = wishlist.items.find(i => i.productId === productId);
  
  if (!item) {
    throw new Error('Item not found in wishlist');
  }

  return await prisma.wishlistItem.delete({
    where: { id: item.id }
  });
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
