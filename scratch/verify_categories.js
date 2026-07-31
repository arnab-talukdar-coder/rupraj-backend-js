const prisma = require('../src/config/db');

async function main() {
  try {
    const goldTree = await prisma.category.findMany({
      where: { name: 'Gold', parentId: null },
      include: {
        children: {
          include: {
            children: true
          }
        }
      }
    });

    console.log('Gold Tree Structure:');
    goldTree[0].children.forEach(cat => {
      console.log(`- ${cat.name} (${cat.children.length} sub-items)`);
    });

    const silverCount = await prisma.category.count({
      where: { parent: { name: 'Silver' } }
    });
    console.log(`\nSilver Categories: ${silverCount}`);

    const diamondCount = await prisma.category.count({
      where: { parent: { name: 'Diamond' } }
    });
    console.log(`Diamond Categories: ${diamondCount}`);

  } catch (err) {
    console.error('Error verifying categories:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
