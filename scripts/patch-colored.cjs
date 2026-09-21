const fs = require('fs');
let code = fs.readFileSync('src/components/home/HeroSlider.tsx', 'utf8');

code = code.replace(
  /'bg-white dark:bg-\[\#112240\] border-blue-600 shadow-lg shadow-blue-500\/20 text-slate-900 dark:text-white'/g,
  "'bg-blue-600 dark:bg-blue-600 border-blue-700 shadow-lg shadow-blue-500/30 text-white'"
);

code = code.replace(
  /'bg-white hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-gray-200 dark:border-\[\#233554\] hover:border-blue-300 text-slate-700 dark:text-slate-300'/g,
  "'bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/50 dark:hover:bg-slate-700 border-slate-200 dark:border-[#233554] hover:border-blue-300 text-slate-700 dark:text-slate-300'"
);

code = code.replace(
  /isCurrent \? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-transparent text-slate-700 dark:text-slate-300 border border-gray-300 dark:border-\[\#233554\]'/g,
  "isCurrent ? 'bg-white/20 text-white' : 'bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#233554]'"
);

code = code.replace(
  /isCurrent \? 'text-blue-700' : 'text-slate-800 dark:text-slate-200'/g,
  "isCurrent ? 'text-white' : 'text-slate-800 dark:text-slate-200'"
);

code = code.replace(
  /isCurrent \? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'/g,
  "isCurrent ? 'text-blue-100 font-semibold' : 'text-slate-500 dark:text-slate-400'"
);

// Update stats blocks
code = code.replace(
  /<div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm">\n            <div className="text-3xl sm:text-4xl font-black text-blue-700 dark:text-blue-400 font-mono tracking-tight">&gt;30 лет<\/div>\n            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold mt-2 leading-snug">надежности на рынке РФ<\/div>\n          <\/div>/g,
  `<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-5 rounded-2xl shadow-sm">
            <div className="text-3xl sm:text-4xl font-black text-blue-700 dark:text-blue-400 font-mono tracking-tight">&gt;30 лет</div>
            <div className="text-sm sm:text-base text-blue-900/80 dark:text-blue-300 font-semibold mt-2 leading-snug">надежности на рынке РФ</div>
          </div>`
);

code = code.replace(
  /<div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm">\n            <div className="text-3xl sm:text-4xl font-black text-blue-700 dark:text-blue-400 font-mono tracking-tight">500\+<\/div>\n            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold mt-2 leading-snug">проектов и внедрений<\/div>\n          <\/div>/g,
  `<div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-5 rounded-2xl shadow-sm">
            <div className="text-3xl sm:text-4xl font-black text-indigo-700 dark:text-indigo-400 font-mono tracking-tight">500+</div>
            <div className="text-sm sm:text-base text-indigo-900/80 dark:text-indigo-300 font-semibold mt-2 leading-snug">проектов и внедрений</div>
          </div>`
);

code = code.replace(
  /<div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm">\n            <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">100%<\/div>\n            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold mt-2 leading-snug">собственный сервис КИМ<\/div>\n          <\/div>/g,
  `<div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-5 rounded-2xl shadow-sm">
            <div className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tight">100%</div>
            <div className="text-sm sm:text-base text-emerald-900/80 dark:text-emerald-300 font-semibold mt-2 leading-snug">собственный сервис КИМ</div>
          </div>`
);

code = code.replace(
  /<div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm">\n            <div className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-tight">10\+ брендов<\/div>\n            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold mt-2 leading-snug">официальных партнеров<\/div>\n          <\/div>/g,
  `<div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/50 p-5 rounded-2xl shadow-sm">
            <div className="text-3xl sm:text-4xl font-black text-cyan-700 dark:text-cyan-400 font-mono tracking-tight">10+ брендов</div>
            <div className="text-sm sm:text-base text-cyan-900/80 dark:text-cyan-300 font-semibold mt-2 leading-snug">официальных партнеров</div>
          </div>`
);

fs.writeFileSync('src/components/home/HeroSlider.tsx', code);
console.log('Colored tabs and stats patched');
