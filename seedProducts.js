const prisma = require('./src/config/db');

async function seedProducts() {
  console.log('Seeding products...');
  try {
    // Find categories to attach products
    const ringsCat = await prisma.category.findFirst({ where: { name: 'Ladies ring ( casting)' } });
    const necklaceCat = await prisma.category.findFirst({ where: { name: 'Necklace' } });
    const diamondRingCat = await prisma.category.findFirst({ where: { name: 'Ladies ring', parent: { name: 'Diamond' } } });
    const earringCat = await prisma.category.findFirst({ where: { name: 'Jhumka' } });

    const defaultImages = [
      "https://images.unsplash.com/photo-1599643478514-46b158097d76?w=500&q=80",
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=500&q=80"
    ];

    const products = [
      {
        name: 'Classic 22k Gold Ring',
        description: 'A timeless 22k yellow gold ring perfect for daily wear.',
        purity: '22k',
        metalType: 'Gold',
        metalColor: 'Yellow',
        weight: 3.5,
        makingCharges: 1500,
        images: defaultImages,
        stock: 10,
        categoryId: ringsCat?.id
      },
      {
        name: 'Bridal Heritage Necklace',
        description: 'Intricately designed 22k gold necklace for weddings.',
        purity: '22k',
        metalType: 'Gold',
        metalColor: 'Yellow',
        weight: 45.2,
        makingCharges: 12000,
        images: [
          "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=500&q=80"
        ],
        stock: 3,
        categoryId: necklaceCat?.id
      },
      {
        name: 'Diamond Solitaire Ring',
        description: 'Beautiful 18k white gold ring with a 1-carat diamond solitaire.',
        purity: '18k',
        metalType: 'Gold',
        metalColor: 'White',
        diamondWeight: 1.0,
        diamondColor: 'F-G',
        diamondClarity: 'VVS1',
        weight: 4.0,
        makingCharges: 3500,
        images: [
          "https://images.unsplash.com/photo-1605100804763-247f67b4548e?w=500&q=80"
        ],
        stock: 5,
        categoryId: diamondRingCat?.id || ringsCat?.id
      },
      {
        name: 'Traditional Temple Jhumka',
        description: 'Antique finish 22k gold jhumkas with intricate temple motifs.',
        purity: '22k',
        metalType: 'Gold',
        metalColor: 'Yellow',
        weight: 12.4,
        makingCharges: 4200,
        images: [
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80"
        ],
        stock: 8,
        categoryId: earringCat?.id
      }
    ];

    let createdCount = 0;
    for (const prodData of products) {
      if (!prodData.categoryId) {
        // Fallback category if specific not found
        const fallback = await prisma.category.findFirst();
        if (fallback) prodData.categoryId = fallback.id;
      }
      
      if (prodData.categoryId) {
        await prisma.product.create({
          data: prodData
        });
        createdCount++;
      }
    }

    console.log(`Successfully seeded ${createdCount} products!`);
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
