const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf-8');

// The first match got replaced. I will rebuild AccountButton correctly and fix the mobile menu button.
content = content.replace(/const AccountButton = \(\{ isMobile[\s\S]*?className="inline-flex items-center gap-1 px-2 py-0\.5[\s\S]*?<\/button>\n  \);\n\};\n/g, '');

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

// The mobile menu button was replaced as well, let's make sure it's `<AccountButton isMobile={true} ... />`
content = content.replace(/<AccountButton isMobile=\{true\} handleNav=\{handleNav\} currentUser=\{currentUser\} isAdmin=\{isAdmin\} \/>/g, '<AccountButton isMobile={true} handleNav={handleNav} currentUser={currentUser} isAdmin={isAdmin} />');


fs.writeFileSync('src/components/layout/Header.tsx', content);
