const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf-8');

content = content.replace(
  /\{\/\* Account Button \(Mobile\) \*\/\}\n\s*<AccountButton/g,
  '<AccountButton'
);

fs.writeFileSync('src/components/layout/Header.tsx', content);
