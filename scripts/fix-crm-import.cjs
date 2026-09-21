const fs = require('fs');
let code = fs.readFileSync('src/pages/CrmPage.tsx', 'utf8');
code = code.replace("import { CrmAdminView } from '../components/cms/CrmAdminView';", "import { CrmAdminView } from '../components/CrmAdminView';");
fs.writeFileSync('src/pages/CrmPage.tsx', code);
console.log('Fixed CrmAdminView import');
