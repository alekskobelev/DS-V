const fs = require('fs');
let code = fs.readFileSync('src/components/home/HeroSlider.tsx', 'utf8');

// Fix primary button text
code = code.replace(
  /bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-slate-900 dark:text-white/g,
  'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
);

// Fix badge active number
code = code.replace(
  /bg-blue-600 text-slate-900 dark:text-white/g,
  'bg-blue-600 text-white'
);

// Fix container classes
code = code.replace(
  /bg-slate-50 dark:bg-slate-50 dark:bg-\[\#0a192f\] text-slate-900 dark:text-slate-900 dark:text-white/g,
  'bg-slate-50 dark:bg-[#0a192f] text-slate-900 dark:text-white'
);

fs.writeFileSync('src/components/home/HeroSlider.tsx', code);
console.log('Fixed blue button text and container class');
