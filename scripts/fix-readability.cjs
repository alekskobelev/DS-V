const fs = require('fs');
let code = fs.readFileSync('src/components/home/HeroSlider.tsx', 'utf8');

// 1. Описание слайда (text-slate-600 -> text-blue-100)
code = code.replace(
  /<p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">/g,
  '<p className="text-xs sm:text-sm lg:text-base text-blue-100 font-normal leading-relaxed max-w-2xl">'
);

// 2. Вторичная кнопка (text-slate-700 -> text-white, border-gray-200 -> border-white/30)
code = code.replace(
  /className="px-5 py-3 bg-transparent hover:bg-white\/5 active:bg-white\/10 border border-gray-200 dark:border-\[\#233554\] hover:border-blue-400 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"/g,
  'className="px-5 py-3 bg-transparent hover:bg-white/10 active:bg-white/20 border border-white/30 hover:border-white text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"'
);

// 3. Табы навигации внизу (сделать контрастнее)
code = code.replace(
  /isCurrent \? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-transparent text-slate-600 dark:text-slate-400 border border-gray-300 dark:border-\[\#233554\]'/g,
  "isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-transparent text-slate-700 dark:text-slate-300 border border-gray-300 dark:border-[#233554]'"
);

code = code.replace(
  /className=\{`text-xs font-bold leading-tight \$\{isCurrent \? 'text-blue-400' : 'text-slate-600 dark:text-slate-300'}`\}/g,
  "className={`text-xs font-bold leading-tight ${isCurrent ? 'text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}"
);

code = code.replace(
  /className=\{`text-\[11px\] leading-snug \$\{isCurrent \? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'}`\}/g,
  "className={`text-[11px] leading-snug ${isCurrent ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-300'}`}"
);

// Сделаем фон неактивного таба чуть заметнее, а активного - 100% белый
code = code.replace(
  /'bg-transparent hover:bg-white dark:hover:bg-\[\#112240\] border-gray-300 dark:border-\[\#233554\] hover:border-blue-400 text-slate-600 dark:text-slate-400'/g,
  "'bg-white/50 hover:bg-white dark:bg-transparent dark:hover:bg-[#112240] border-gray-300 dark:border-[#233554] hover:border-blue-400 text-slate-700 dark:text-slate-300'"
);

fs.writeFileSync('src/components/home/HeroSlider.tsx', code);
console.log('Fixed readability');
