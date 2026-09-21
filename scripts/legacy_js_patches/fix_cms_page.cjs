const fs = require('fs');

let content = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

// Clear placeholders
content = content.replace(
  /placeholder="a.skobelev@ds-enginering.ru"/g,
  'placeholder="Введите email"'
);
content = content.replace(
  /placeholder="admin123"/g,
  'placeholder="Введите пароль"'
);

// Remove Quick 1-Click Login for 5 Administrators
const startStr = '{/* Quick 1-Click Login for 5 Administrators */}';
const endStr = '{/* Standard Login Form */}';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
} else {
  console.log("Could not find quick login bounds.");
}

// Rename the title of the standard login form
content = content.replace(
  'Или введите учетные данные администратора:',
  'Введите учетные данные администратора:'
);

fs.writeFileSync('src/pages/CmsPage.tsx', content);
console.log('Fixed CmsPage.tsx');
