const fs = require('fs');

let content = fs.readFileSync('src/components/home/SolutionMatcher.tsx', 'utf8');

// Fix PMT Alpha P
content = content.replace(/linkId:\s*'pmt-arm-alpha-p'/g, "linkId: 'pmt-alpha-p'");

// Fix PMT Elite (let's map it to pmt-alpha-e or pmt-gamma-plus-e, let's use pmt-alpha-e)
content = content.replace(/linkId:\s*'pmt-arm-elite'/g, "linkId: 'pmt-alpha-e'");

fs.writeFileSync('src/components/home/SolutionMatcher.tsx', content);
console.log('Fixed linkIds in SolutionMatcher.tsx');
