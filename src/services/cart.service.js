const prisma = require('../config/db');

const getCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: { include: { product: true } }
      }
    });
  }
  return cart;
};

const addCartItem = async (userId, productId, quantity) => {
  const cart = await getCart(userId);
  
  const existingItem = cart.items.find(item => item.productId === productId);
  if (existingItem) {
    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity }
    });
  } else {
    return await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity
      }
    });
  }
};

const updateCartItem = async (userId, cartItemId, quantity) => {
  const cart = await getCart(userId);
  const item = cart.items.find(i => i.id === cartItemId);
  
  if (!item) {
    throw new Error('Cart item not found');
  }

  return await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity }
  });
};

const removeCartItem = async (userId, cartItemId) => {
  const cart = await getCart(userId);
  const item = cart.items.find(i => i.id === cartItemId);
  
  if (!item) {
    throw new Error('Cart item not found');
  }

  return await prisma.cartItem.delete({
    where: { id: cartItemId }
  });
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem
};
