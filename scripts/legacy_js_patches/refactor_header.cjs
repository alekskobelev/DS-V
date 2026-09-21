const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf-8');

// 1. We want to extract Account button to a helper component inside Header.tsx
const accountBtnComp = `
const AccountButton = ({ isMobile, handleNav, currentUser, isAdmin }: any) => {
  if (isMobile) {
    return (
      <button
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
      </button>
    );
  }
  return (
    <button
      onClick={() => handleNav('account')}
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors text-[10px] sm:text-[11px]"
      title={currentUser ? \`Профиль: \${currentUser.fullName}\` : 'Вход в личный кабинет'}
    >
      <User className="w-3 h-3 text-blue-300 shrink-0" />
      <span className="max-w-[100px] xl:max-w-[110px] truncate">
        {currentUser ? currentUser.fullName.split(' ')[0] : 'Кабинет'}
      </span>
    </button>
  );
};
`;

content = content.replace('export const Header: React.FC = () => {', accountBtnComp + '\nexport const Header: React.FC = () => {');

// 2. Replace the first duplicate Account button (tablet)
content = content.replace(/<button\s+id="topbar-account-btn-tablet"[\s\S]*?<\/button>/, '{/* Account Button (Tablet) */}\n              <div className="xl:hidden"><AccountButton isMobile={false} handleNav={handleNav} currentUser={currentUser} /></div>');

// 3. Replace the second duplicate Account button (desktop)
content = content.replace(/<button\s+id="topbar-account-btn-desktop"[\s\S]*?<\/button>/, '{/* Account Button (Desktop) */}\n              <div className="hidden xl:block"><AccountButton isMobile={false} handleNav={handleNav} currentUser={currentUser} /></div>');

// 4. Replace the mobile menu account button
content = content.replace(/<button\s+onClick=\{\(\) => handleNav\('account'\)\}\s+className="text-left px-3 py-2\.5 rounded-lg hover:bg-blue-50 text-gray-800 hover:text-blue-600 flex items-center justify-between"[\s\S]*?<\/button>/, '{/* Account Button (Mobile) */}\n            <AccountButton isMobile={true} handleNav={handleNav} currentUser={currentUser} isAdmin={isAdmin} />');


fs.writeFileSync('src/components/layout/Header.tsx', content);
console.log('Account buttons refactored.');
