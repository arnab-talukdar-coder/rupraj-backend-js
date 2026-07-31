const prisma = require('../src/config/db');

const categoryImages = {
  'bracelets': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  'earrings': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
  'gents ring': 'https://images.unsplash.com/photo-1605100804763-247f67b8548e?w=600&q=80',
  'ladies ring': 'https://images.unsplash.com/photo-1605100804763-247f67b8548e?w=600&q=80', // Will use a different one
  'bangles': 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80',
  'chains': 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80',
  'pendants': 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80',
  'mangalsutra': 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80',
};

// Refined image mapping for different types
const imagesMap = {
  earrings: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'],
  bracelets: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'],
  bangles: ['https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80'],
  'finger rings': ['https://images.unsplash.com/photo-1605100804763-247f67b8548e?w=800&q=80'],
  'ladies ring': ['https://images.unsplash.com/photo-1605100804763-247f67b8548e?w=800&q=80'],
  'gents ring': ['https://images.unsplash.com/photo-1605100804763-247f67b8548e?w=800&q=80'],
  pendants: ['https://images.unsplash.com/photo-1599643478144-889811f21568?w=800&q=80'], // Added distinct pendant image
  chains: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80'],
  mangalsutra: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80'],
};

async function main() {
  const allCategories = await prisma.category.findMany();
  
  // Figure out the tree
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

  const level1 = [];
  rootCategories.forEach(root => {
    root.children.forEach(child => level1.push(child));
  });

  console.log(`Found ${level1.length} level 1 categories.`);

  // Create one product for each level 1 category if it doesn't exist, or just update the first one
  for (const cat of level1) {
    const images = imagesMap[cat.name.toLowerCase()] || ['https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800&q=80']; // Fallback
    
    let product = await prisma.product.findFirst({
      where: { categoryId: cat.id }
    });

    if (product) {
      console.log(`Updating existing product for category: ${cat.name}`);
      await prisma.product.update({
        where: { id: product.id },
        data: { images }
      });
    } else {
      console.log(`Creating new product for category: ${cat.name}`);
      await prisma.product.create({
        data: {
          name: `Classic ${cat.name}`,
          description: `A stunning collection piece representing our exquisite ${cat.name} craftsmanship.`,
          categoryId: cat.id,
          basePrice: 15000,
          weight: 10.5,
          makingCharges: 3000,
          purity: '22K',
          stock: 5,
          tags: ['trending', cat.name.toLowerCase()],
          images
        }
      });
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
