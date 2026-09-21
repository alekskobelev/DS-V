const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

// 1. Remove the accidentally injected button in the auth form
const badButtonRegex = /\s*<button\s+onClick=\{\(\) => setActiveTab\('requests'\)\}[\s\S]*?Мои заявки\s+<\/button>/;
code = code.replace(badButtonRegex, '');

// 2. Add the proper Requests button next to Contracts
const goodButton = `
          <button
            onClick={() => setActiveTab('requests')}
            className={\`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all \${
              activeTab === 'requests'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }\`}
          >
            Мои заявки и КП ({rfqs ? rfqs.length : 0})
          </button>
`;
code = code.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\('contracts'\)\}/,
  goodButton + "\n          <button\n            onClick={() => setActiveTab('contracts')}"
);

fs.writeFileSync('src/pages/AccountPage.tsx', code);
console.log('Fixed AccountPage.tsx');
