const fs = require('fs');
let code = fs.readFileSync('src/components/home/HeroSlider.tsx', 'utf8');

code = code.replace(
  /className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 font-bold rounded-xl shadow-lg transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer"/g,
  'className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold rounded-xl text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"'
);

fs.writeFileSync('src/components/home/HeroSlider.tsx', code);
console.log('Primary btn patched');
