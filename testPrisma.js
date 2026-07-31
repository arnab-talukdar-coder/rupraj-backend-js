const prisma = require('./src/config/db');
(async () => {
  try {
    const categories = await prisma.category.findMany();
    console.log(categories);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
})();
