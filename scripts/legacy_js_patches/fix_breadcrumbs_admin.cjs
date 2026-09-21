const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Breadcrumbs.tsx', 'utf8');

code = code.replace(
  'const { currentPage',
  'const { isAdmin, currentPage'
);

fs.writeFileSync('src/components/layout/Breadcrumbs.tsx', code);
console.log('Fixed isAdmin in Breadcrumbs.tsx');
