const fs = require('fs');
let code = fs.readFileSync('src/components/home/HeroSlider.tsx', 'utf8');

// 1. Увеличиваем размер кнопок в слайдере и делаем их ярче для белой темы
// Первичная кнопка: bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-6 py-4 rounded-xl text-sm sm:text-base ...
// Было: bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/30 transition-all

code = code.replace(
  /className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500\/30 transition-all flex items-center justify-center gap-2"/g,
  'className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold rounded-xl text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"'
);

// Вторичная кнопка (полупрозрачная с белой рамкой)
code = code.replace(
  /className="px-5 py-3 bg-transparent hover:bg-white\/10 active:bg-white\/20 border border-white\/30 hover:border-white text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"/g,
  'className="px-6 py-3.5 bg-white/10 hover:bg-white/20 active:bg-white/30 border-2 border-white/40 hover:border-white text-white font-bold rounded-xl text-sm sm:text-base shadow-lg transition-all cursor-pointer"'
);

// 2. Исправляем блок статистики под слайдером (убираем белые карточки, делаем их прозрачными или синими)
const oldStats = `<div className="pt-5 border-t border-gray-200 dark:border-[#233554] grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
          <div className="bg-white dark:bg-[#112240] p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-[#233554] shadow-sm">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">&gt;30 лет</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1">надежности на рынке РФ</div>
          </div>
          <div className="bg-white dark:bg-[#112240] p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-[#233554] shadow-md">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-600 font-mono tracking-tight">500+</div>
            <div className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-1">проектов и внедрений</div>
          </div>
          <div className="bg-white dark:bg-[#112240] p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-[#233554] shadow-md">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">100%</div>
            <div className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-1">собственный сервис КИМ</div>
          </div>
          <div className="bg-white dark:bg-[#112240] p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-[#233554] shadow-md">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-tight">10+ брендов</div>
            <div className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-1">официальных партнеров</div>
          </div>
        </div>`;

const newStats = `<div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
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

code = code.replace(oldStats, newStats);

fs.writeFileSync('src/components/home/HeroSlider.tsx', code);
console.log('Hero Slider buttons and stats patched');
