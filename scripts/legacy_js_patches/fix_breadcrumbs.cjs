const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Breadcrumbs.tsx', 'utf8');

code = code.replace(
  /case 'account': return 'Личный кабинет заказчика';/,
  "case 'account': return isAdmin ? 'Личный кабинет' : 'Личный кабинет заказчика';"
);

if (!code.includes('isAdmin') && code.includes('const { currentPage')) {
  code = code.replace('const { currentPage', 'const { isAdmin, currentPage');
}

fs.writeFileSync('src/components/layout/Breadcrumbs.tsx', code);
console.log('Breadcrumbs fixed');
