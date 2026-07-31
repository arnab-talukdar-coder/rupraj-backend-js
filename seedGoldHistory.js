const prisma = require('./src/config/db');

async function seedHistory() {
  const karats = ['9 Karat', '14 Karat', '18 Karat', '22 Karat', '24 Karat'];
  const baseRates = {
    '9 Karat': 6000,
    '14 Karat': 9000,
    '18 Karat': 11500,
    '22 Karat': 14200,
    '24 Karat': 15500
  };

  const today = new Date();
  
  // Clean existing history to prevent duplicates during testing
  await prisma.goldRateHistory.deleteMany();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0); // Normalize to start of day

    for (const karat of karats) {
      // Add some random fluctuation (-100 to +100)
      const fluctuation = Math.floor(Math.random() * 200) - 100;
      // Make it trend slightly upwards over the 30 days
      const trend = (30 - i) * 10;
      
      const rate = baseRates[karat] + fluctuation + trend;

      await prisma.goldRateHistory.create({
        data: {
          karat,
          rate,
          date
        }
      });
    }
  }

  console.log('Seeded 30 days of Gold Rate History successfully!');
}

seedHistory()
  .catch(console.error)
  .finally(() => process.exit(0));
