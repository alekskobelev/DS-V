const fs = require('fs');
let content = fs.readFileSync('src/services/apiService.ts', 'utf8');

content = content.replace(
  `}

  async saveCrmFunnel`,
  `},

  async saveCrmFunnel`
);

content = content.replace(
  `}

  async getCrmDeals`,
  `},

  async getCrmDeals`
);

fs.writeFileSync('src/services/apiService.ts', content);
console.log('Fixed commas in apiService');
