const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf-8');

const target = `<button
              onClick={() => handleNav('account')}
              className="text-left px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-800 hover:text-blue-600 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>{currentUser ? currentUser.fullName : 'Личный кабинет'}</span>
              </div>
              {isAdmin && (
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">Admin</span>
              )}
            </button>`;

content = content.replace(target, '<AccountButton isMobile={true} handleNav={handleNav} currentUser={currentUser} isAdmin={isAdmin} />');
fs.writeFileSync('src/components/layout/Header.tsx', content);
