const prisma = require('./src/config/db');
(async () => {
  try {
    const products = await prisma.product.findMany();
    console.log(products);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
})();
