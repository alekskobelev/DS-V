const fs = require('fs');
let code = fs.readFileSync('src/components/home/HeroSlider.tsx', 'utf8');

// Возвращаем белые плашки под статистику, но делаем их чище (без бордеров)
const oldStats = `<div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          <div className="flex flex-col">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">&gt;30 лет</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1">надежности на рынке РФ</div>
          </div>
          <div className="flex flex-col">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">500+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1">проектов и внедрений</div>
          </div>
          <div className="flex flex-col">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">100%</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1">собственный сервис КИМ</div>
          </div>
          <div className="flex flex-col">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">10+ брендов</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1">официальных партнеров</div>
          </div>
        </div>`;

const newStats = `<div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-3xl sm:text-4xl font-black text-blue-700 dark:text-blue-400 font-mono tracking-tight">&gt;30 лет</div>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold mt-2 leading-snug">надежности на рынке РФ</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-3xl sm:text-4xl font-black text-blue-700 dark:text-blue-400 font-mono tracking-tight">500+</div>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold mt-2 leading-snug">проектов и внедрений</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">100%</div>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold mt-2 leading-snug">собственный сервис КИМ</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-tight">10+ брендов</div>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold mt-2 leading-snug">официальных партнеров</div>
          </div>
        </div>`;

code = code.replace(oldStats, newStats);

// Увеличиваем размер табов внизу и делаем заливку у неактивных табов более плотной
code = code.replace(
  /className=\{`p-3 rounded-xl text-left border transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between \$\{/g,
  'className={`p-4 rounded-xl text-left border-2 transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between ${'
);

code = code.replace(
  /'bg-white dark:bg-\[\#112240\] border-2 border-blue-500 shadow-md shadow-blue-500\/20 text-slate-900 dark:text-white'/g,
  "'bg-white dark:bg-[#112240] border-blue-600 shadow-lg shadow-blue-500/20 text-slate-900 dark:text-white'"
);

code = code.replace(
  /'bg-white\/50 hover:bg-white dark:bg-transparent dark:hover:bg-\[\#112240\] border-gray-300 dark:border-\[\#233554\] hover:border-blue-400 text-slate-700 dark:text-slate-300'/g,
  "'bg-white hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-gray-200 dark:border-[#233554] hover:border-blue-300 text-slate-700 dark:text-slate-300'"
);

// Увеличиваем шрифты внутри табов
code = code.replace(
  /className=\{`text-xs font-bold leading-tight \$\{isCurrent \? 'text-blue-400' : 'text-slate-700 dark:text-slate-200'\}`\}/g,
  "className={`text-sm font-extrabold leading-tight ${isCurrent ? 'text-blue-700' : 'text-slate-800 dark:text-slate-200'}`}"
);

code = code.replace(
  /className=\{`text-\[11px\] leading-snug \$\{isCurrent \? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-300'\}`\}/g,
  "className={`text-xs mt-1 leading-snug ${isCurrent ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'}`}"
);

fs.writeFileSync('src/components/home/HeroSlider.tsx', code);
console.log('Tabs and stats patched');
