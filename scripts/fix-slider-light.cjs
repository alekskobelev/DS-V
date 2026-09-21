const fs = require('fs');
let code = fs.readFileSync('src/components/home/HeroSlider.tsx', 'utf8');

// Fix Category Pill
code = code.replace(
  /bg-blue-900\/30 border border-blue-500\/30 text-xs font-bold text-blue-300/g,
  'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30 text-xs font-bold text-blue-800 dark:text-blue-300'
);

// Fix inactive tab
code = code.replace(
  /'bg-transparent hover:bg-white dark:bg-\[\#112240\] border-gray-200 dark:border-\[\#233554\] hover:border-blue-400 text-slate-500 dark:text-slate-400'/g,
  "'bg-transparent hover:bg-white dark:hover:bg-[#112240] border-gray-300 dark:border-[#233554] hover:border-blue-400 text-slate-600 dark:text-slate-400'"
);

// Fix inactive badge number
code = code.replace(
  /'bg-gray-100 text-slate-500 dark:text-slate-400 border border-gray-200 dark:border-\[\#233554\]'/g,
  "'bg-gray-100 dark:bg-transparent text-slate-600 dark:text-slate-400 border border-gray-300 dark:border-[#233554]'"
);

// Fix emerald and cyan text in stats
code = code.replace(/text-emerald-400/g, 'text-emerald-600 dark:text-emerald-400');
code = code.replace(/text-cyan-600/g, 'text-cyan-600 dark:text-cyan-400');

fs.writeFileSync('src/components/home/HeroSlider.tsx', code);
console.log('Fixed slider light mode colors');
