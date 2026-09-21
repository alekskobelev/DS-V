const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

// 1. Add import for CrmPanel
if (!code.includes("import { CrmPanel }")) {
  code = code.replace(
    "import { apiService } from '../services/apiService';",
    "import { apiService } from '../services/apiService';\nimport { CrmPanel } from '../components/crm/CrmPanel';"
  );
}

// 2. Expand activeTab type
code = code.replace(
  "useState<'contracts' | 'tickets' | 'licenses' | 'team' | 'requests'>('requests');",
  "useState<'contracts' | 'tickets' | 'licenses' | 'team' | 'requests' | 'crm'>(isAdmin ? 'crm' : 'requests');"
);

// 3. Add CRM button for Admins (in Tabs Switcher)
const crmButton = `
          {isAdmin && (
            <button
              onClick={() => setActiveTab('crm')}
              className={\`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all \${
                activeTab === 'crm'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }\`}
            >
              CRM-система
            </button>
          )}
`;
code = code.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\('requests'\)\}/,
  crmButton + "\n          <button\n            onClick={() => setActiveTab('requests')}"
);

// 4. Also hide the simple 'requests' tab button for Admins if CRM is better? 
// Wait, the user said "Личный кабинет заказчика - должен так называться только для Заказчика... В личном кабинете должны отображаться заявки на КП и демо."
// So Admins use CRM to see it. 

code = code.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\('requests'\)\}[\s\S]*?<\/button>/,
  `{!isAdmin && (
$&
          )}`
);

// 5. Render CrmPanel when activeTab === 'crm'
const crmContent = `
      {/* Tab: CRM System (Admin Only) */}
      {activeTab === 'crm' && isAdmin && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CrmPanel />
        </div>
      )}
`;
code = code.replace(
  /\{\/\* Tab 1: Contracts & Deliveries \*\/\}/,
  crmContent + "\n      {/* Tab 1: Contracts & Deliveries */}"
);

// 6. Hide the simple requests tab content for Admins
code = code.replace(
  /\{activeTab === 'requests' && \(/,
  "{activeTab === 'requests' && !isAdmin && ("
);

fs.writeFileSync('src/pages/AccountPage.tsx', code);
console.log('AccountPage updated with CRM');
