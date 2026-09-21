const fs = require('fs');

function replaceFeaturesRender(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('import { FeatureList } from')) {
    code = code.replace(
      'import React', 
      'import React from \'react\';\nimport { FeatureList } from \'../components/common/FeatureList\';\n//'
    );
    
    code = code.replace(
      /<ul className="space-y-2">\s*\{activeService\.deliverables\.map\(\(item, i\) => \(\s*<li key=\{i\} className="flex items-start gap-2">\s*<CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0\.5" \/>\s*<span className="text-gray-700">\{item\}<\/span>\s*<\/li>\s*\)\)\}\s*<\/ul>/g,
      '<FeatureList features={activeService.deliverables} className="space-y-2" itemClassName="flex items-start gap-2 text-gray-700" />'
    );
    fs.writeFileSync(file, code);
    console.log('Patched', file);
  }
}

replaceFeaturesRender('src/pages/ServicesPage.tsx');

