const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

// Remove CRM button
code = code.replace(/<button\s*onClick=\{\(\) => setActiveTab\('crm'\)\}[\s\S]*?<\/button>/g, '');
// Remove CRM content
code = code.replace(/\{activeTab === 'crm' && <CrmAdminView \/>\}/g, '');
// Remove CRM import
code = code.replace(/import \{ CrmAdminView \} from '\.\.\/components\/cms\/CrmAdminView';/g, '');

fs.writeFileSync('src/pages/CmsPage.tsx', code);
console.log('Removed CRM from CMS');
