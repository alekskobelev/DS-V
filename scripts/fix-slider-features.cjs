const fs = require('fs');
let code = fs.readFileSync('src/components/home/HeroSlider.tsx', 'utf8');

code = code.replace(
  /<div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2\.5 text-xs text-slate-600 dark:text-slate-300">/g,
  '<div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-blue-100">'
);

code = code.replace(
  /<CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" \/>/g,
  '<CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />'
);

code = code.replace(
  /<span className="font-semibold text-slate-600 dark:text-slate-300">/g,
  '<span className="font-semibold text-white">'
);

fs.writeFileSync('src/components/home/HeroSlider.tsx', code);
console.log('Fixed features styling');
