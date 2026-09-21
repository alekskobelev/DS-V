const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

// 1. Add 'crm' to activeTab state
code = code.replace(
  /'pages' \| 'catalog' \| 'services' \| 'news' \| 'contacts' \| 'analytics' \| 'qa_backend' \| 'backup'/,
  "'pages' | 'catalog' | 'services' | 'news' | 'contacts' | 'analytics' | 'qa_backend' | 'backup' | 'crm'"
);

// 2. Add CRM button to Sidebar
const newTabHtml = `
            <button
              onClick={() => setActiveTab('crm')}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm
                \${activeTab === 'crm' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-gray-600 hover:bg-white hover:text-blue-600'}\`}
            >
              <Users className="w-5 h-5" />
              CRM & Заявки
            </button>
`;
code = code.replace(
  /(<button[\s\S]*?onClick=\{\(\) => setActiveTab\('analytics'\)\}[\s\S]*?<\/button>)/,
  newTabHtml + '\n$1'
);

// 3. Import Users from lucide-react if not present
if (!code.includes('Users,') && !code.includes(' Users ')) {
  code = code.replace('import {', 'import { Users,');
}

// 4. Add CRM View block
const crmBlock = `
        {/* CRM View */}
        {activeTab === 'crm' && <CrmAdminView />}
`;
code = code.replace(
  /{activeTab === 'pages' && \(/,
  crmBlock + '\n        {activeTab === \'pages\' && ('
);

fs.writeFileSync('src/pages/CmsPage.tsx', code);
console.log('Tabs updated');
