const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');

// 1. Top block gap
content = content.replace(
  'py-10 px-4 sm:px-6 lg:px-8',
  'py-6 sm:py-8 px-4 sm:px-6 lg:px-8'
);

// 2. Main footer block gap
content = content.replace(
  'pt-10 pb-6 px-4 sm:px-6 lg:px-8',
  'pt-8 pb-4 px-4 sm:px-6 lg:px-8'
);

// 3. Bottom bar gap
content = content.replace(
  'mt-10 pt-6 border-t border-blue-900/60',
  'mt-8 pt-4 border-t border-blue-900/60'
);

fs.writeFileSync('src/components/layout/Footer.tsx', content);
console.log('Footer updated');
