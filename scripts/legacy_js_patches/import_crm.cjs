const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

// Add import
const importStatement = "import { CrmAdminView } from '../components/CrmAdminView';\n";
if (!code.includes('import { CrmAdminView }')) {
  code = importStatement + code;
}

fs.writeFileSync('src/pages/CmsPage.tsx', code);
console.log('CrmAdminView imported');
