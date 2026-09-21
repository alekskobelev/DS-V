const fs = require('fs');
let code = fs.readFileSync('src/components/home/HeroSlider.tsx', 'utf8');

// Fix • с 1995 года
code = code.replace(
  /<span className="text-blue-400 font-bold">• с 1995/g,
  '<span className="text-blue-600 dark:text-blue-400 font-bold">• с 1995'
);

// Fix navigation controls hover
code = code.replace(
  /hover:bg-\[\#233554\]/g,
  'hover:bg-gray-100 dark:hover:bg-[#233554]'
);

code = code.replace(
  /hover:text-slate-900 dark:text-white/g,
  'hover:text-slate-900 dark:hover:text-white'
);

// Fix active tab text color in bottom nav if any is hardcoded text-white
// Looking at isCurrent check
// {isCurrent ? 'text-slate-900 dark:text-white font-semibold' : ... } -> we already have it.

fs.writeFileSync('src/components/home/HeroSlider.tsx', code);
console.log('Fixed slider misc colors');
