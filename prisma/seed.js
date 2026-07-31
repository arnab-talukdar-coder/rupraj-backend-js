const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  // Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Helper function for upserting categories
  async function upsertCategory(name, parentId = null, description = null) {
    let cat = await prisma.category.findFirst({
      where: { name, parentId }
    });

    if (cat) {
      if (description && cat.description !== description) {
        cat = await prisma.category.update({
          where: { id: cat.id },
          data: { description }
        });
      }
    } else {
      cat = await prisma.category.create({
        data: { name, parentId, description }
      });
    }
    return cat;
  }

  // Gold Categories
  const gold = await upsertCategory('Gold', null, 'Gold Jewellery');

  const goldData = [
    { name: 'Earring', sub: ['Pasa', 'Jhumka', 'Sui Suta Earring', 'Safetipin Earring', 'Fullkan', 'Makri', 'Bauti', 'Bellkuri + Ball Tops', 'Kanbala', 'Casting Tops', 'Dull'] },
    { name: 'Pearl + Cristal', sub: ['Necklace ( Pearl + Cristal)', 'Choker ( Pearl + Cristal)', 'Earring ( Pearl + Cristal)', '5 pis + 3 pis + 1 pis', 'Mantasa', 'Pearl Pendent', 'Pearl Lohori + Sitahar', 'Chatai Necklace'] },
    { name: 'Finger ring', sub: ['Baby ring', 'Gents ring', 'Ladies ring ( casting)', 'Boat ring', 'Umbrella ring', 'Thumb ring', 'Cater piller ring', 'pola ring'] },
    { name: 'Sankha', sub: ['Pat Sankha', 'Design Sankha', 'Mukh Sankha'] },
    { name: 'Pola', sub: ['Pat Pola', 'Design Pola', 'Mukh Pola', 'Prsting Pola'] },
    { name: 'Noa', sub: ['Pat Noa', 'Mukh Noa', 'Nalf round Noa', 'Full Cover noa'] },
    { name: 'Chain', sub: ['Baby Chain', 'Ladies Chain', 'Men\'s Chain', 'Mangal Sutra', 'Fancy Chain', 'Tie Chain'] },
    { name: 'Wristlet', sub: ['Baby', 'Men\'s', 'Ladies'] },
    { name: 'Losket', sub: ['Gold', 'Pola Locket', 'Fancy Locket'] },
    { name: 'Nosepin', sub: ['Nosepin', 'Diamond Nosepin', 'Noth'] },
    { name: 'Necklace', sub: ['Light weight Necklace', 'Necklace'] },
    { name: 'pola Necklace', sub: ['Pola Necklace'] },
    { name: 'Sithahar', sub: ['Light weight Sitahar', 'Sitahar'] },
    { name: 'Lohori', sub: ['Light weight Lohori', 'lohori'] },
    { name: 'Choker', sub: ['Light weight choker', 'Choker'] },
    { name: 'Bala', sub: ['Mukh Bala', 'Ruli Bala'] },
    { name: 'Punjabi Kara', sub: ['Punjabi kara'] },
    { name: 'Mantasa', sub: ['Mantasa'] },
    { name: 'Pendent', sub: ['Pendent'] },
    { name: 'Bengle', sub: ['Baby Solid Bangle'] },
    { name: 'Spoon', sub: ['Spoon'] },
    { name: 'Chur + Churi + Kangkan', sub: ['Chur', 'Churi', 'Kangkan'] },
    { name: 'Socket', sub: ['Socket churo', 'Socket bauti', 'socket kangkan'] },
    { name: 'Tikli', sub: ['Tikli'] }
  ];

  for (const cat of goldData) {
    const parent = await upsertCategory(cat.name, gold.id);

    if (cat.sub) {
      for (const subName of cat.sub) {
        await upsertCategory(subName, parent.id);
      }
    }
  }

  // Silver Categories
  const silver = await upsertCategory('Silver', null, 'Silver Jewellery');

  const silverData = [
    'baby ring', 'Mens ring', 'Ladies ring', 'Locket chain with earring', 'Wristlet men', 'Wristlet women', 'Wristlet baby', 'Earring', 'Spoon', 'Glass', 'Bati', 'Plate', 'Rakhi', 'Anklet', 'Baby bangle', 'Ladies bangle', 'Chain', 'Necklace', 'Sindurdani', 'Mukhpola', 'Mukh noa', 'Thakurer mala', 'Najor kathi', 'Baju'
  ];

  for (const name of silverData) {
    await upsertCategory(name, silver.id);
  }

  // Diamond Categories
  const diamond = await upsertCategory('Diamond', null, 'Diamond Jewellery');

  const diamondData = [
    'Ladies ring', 'Gents ring', 'Earrings', 'Pendents', 'Nosepin', 'Bracelets', 'Necklace'
  ];

  for (const name of diamondData) {
    await upsertCategory(name, diamond.id);
  }

  console.log('Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
