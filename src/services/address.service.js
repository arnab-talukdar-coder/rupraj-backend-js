const prisma = require('../config/db');

const getAddresses = async (userId) => {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

const createAddress = async (userId, data) => {
  // If this is the first address, set as default
  const addressCount = await prisma.address.count({ where: { userId } });
  const isDefault = addressCount === 0 || data.isDefault;

  if (isDefault) {
    // Unset other defaults
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });
  }

  return await prisma.address.create({
    data: {
      ...data,
      userId,
      isDefault
    }
  });
};

const updateAddress = async (id, userId, data) => {
  const address = await prisma.address.findFirst({
    where: { id: parseInt(id, 10), userId }
  });

  if (!address) {
    throw new Error('Address not found');
  }

  if (data.isDefault) {
    // Unset other defaults
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });
  }

  return await prisma.address.update({
    where: { id: parseInt(id, 10) },
    data
  });
};

const deleteAddress = async (id, userId) => {
  const address = await prisma.address.findFirst({
    where: { id: parseInt(id, 10), userId }
  });

  if (!address) {
    throw new Error('Address not found');
  }

  return await prisma.address.delete({
    where: { id: parseInt(id, 10) }
  });
};

const setDefaultAddress = async (id, userId) => {
  const address = await prisma.address.findFirst({
    where: { id: parseInt(id, 10), userId }
  });

  if (!address) {
    throw new Error('Address not found');
  }

  // Unset all and set this one
  await prisma.address.updateMany({
    where: { userId },
    data: { isDefault: false }
  });

  return await prisma.address.update({
    where: { id: parseInt(id, 10) },
    data: { isDefault: true }
  });
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
