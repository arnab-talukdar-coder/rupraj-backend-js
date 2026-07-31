const s = require('../src/services/goldRate.service');
s.seedDefaultRates()
  .then(() => { console.log('Seeded!'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
