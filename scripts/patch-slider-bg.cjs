const fs = require('fs');
let code = fs.readFileSync('src/components/home/HeroSlider.tsx', 'utf8');

// Change hardcoded dark bg to dark:bg-[#0a192f] bg-white
// Update text colors to be dynamic as well

code = code.replace(/className="relative overflow-hidden bg-\[\#0a192f\] text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-\[\#112240\]"/g, 'className="relative overflow-hidden bg-slate-50 dark:bg-[#0a192f] text-slate-900 dark:text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-[#112240]"');

// The main card backgrounds
code = code.replace(/bg-\[\#112240\]/g, 'bg-white dark:bg-[#112240]');
code = code.replace(/bg-\[\#0a192f\]/g, 'bg-slate-50 dark:bg-[#0a192f]');

// Text colors
code = code.replace(/text-slate-300/g, 'text-slate-600 dark:text-slate-300');
code = code.replace(/text-slate-200/g, 'text-slate-700 dark:text-slate-200');
code = code.replace(/text-slate-400/g, 'text-slate-500 dark:text-slate-400');
code = code.replace(/text-white/g, 'text-slate-900 dark:text-white');

// Borders
code = code.replace(/border-\[\#233554\]/g, 'border-gray-200 dark:border-[#233554]');

// Active tab bg
code = code.replace(/bg-\[\#112240\] border-2 border-blue-500 shadow-md shadow-blue-500\/20 text-white/g, 'bg-white dark:bg-[#112240] border-2 border-blue-500 shadow-md shadow-blue-500/20 text-slate-900 dark:text-white');

// Secondary Button
code = code.replace(/className="px-5 py-3 bg-transparent hover:bg-white\/5 active:bg-white\/10 border border-\[\#233554\] hover:border-blue-400 text-slate-200 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"/g, 'className="px-5 py-3 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100 dark:active:bg-white/10 border border-gray-200 dark:border-[#233554] hover:border-blue-400 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"');

// Fix buttons text color which was previously text-white inside blue button
code = code.replace(/text-slate-900 dark:text-white flex items-center justify-center/g, 'text-white flex items-center justify-center');
code = code.replace(/text-slate-900 dark:text-white font-bold rounded-xl text-xs sm:text-sm/g, 'text-white font-bold rounded-xl text-xs sm:text-sm');


fs.writeFileSync('src/components/home/HeroSlider.tsx', code);
console.log('Fixed HeroSlider background and buttons');
