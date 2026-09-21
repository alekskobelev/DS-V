const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

const cmsBtnRegex = /<button\s*onClick=\{\(\) => \{\s*setProfileDropdownOpen\(false\);\s*handleNav\('cms'\);\s*\}\}\s*className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2\.5 font-medium transition-colors border-t border-amber-100"/;

const crmBtn = `
                      {(currentUser?.role === 'manager' || currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleNav('crm');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 font-medium transition-colors border-t border-blue-100"
                        >
                          <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                          </svg>
                          <div>
                            <div className="font-bold text-blue-900">CRM-система</div>
                            <div className="text-[10px] text-blue-700">Онлайн-инженер и Заявки</div>
                          </div>
                        </button>
                      )}
`;

if (code.includes('handleNav(\'cms\')') && !code.includes('handleNav(\'crm\')')) {
  code = code.replace(cmsBtnRegex, match => crmBtn + match);
  fs.writeFileSync('src/components/layout/Header.tsx', code);
  console.log('Added CRM button to Header');
} else {
  console.log('Could not find CMS button in Header');
}
