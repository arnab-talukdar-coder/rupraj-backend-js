const prisma = require('../src/config/db');

async function main() {
  try {
    const categories = await prisma.category.findMany();
    console.log('Categories:', JSON.stringify(categories, null, 2));
  } catch (err) {
    console.error('Error fetching categories:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
