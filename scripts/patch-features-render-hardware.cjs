const fs = require('fs');

function replaceFeaturesRender(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('import { FeatureList } from')) {
    // We add the import at the top
    code = code.replace(
      'import React', 
      'import React from \'react\';\nimport { FeatureList } from \'../components/common/FeatureList\';\n//'
    );
    // Remove the old feature map
    code = code.replace(
      /<ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">\s*\{detailProduct\.features\.map\(\(feat, i\) => \(\s*<li key=\{i\} className="flex items-start gap-2 bg-blue-50\/50 p-2 rounded-lg min-w-0">\s*<CheckCircle2 className="w-3\.5 h-3\.5 text-blue-600 shrink-0 mt-0\.5" \/>\s*<span className="flex-1 min-w-0 break-words">\{feat\}<\/span>\s*<\/li>\s*\)\)\}\s*<\/ul>/g,
      '<FeatureList features={detailProduct.features} />'
    );
    
    // Some instances use a slightly different variable like `printProduct.features.map`
    code = code.replace(
      /<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-700">\s*\{printProduct\.features\.map\(\(f, i\) => \(\s*<li key=\{i\} className="flex items-start gap-2 bg-gray-50 p-2 rounded-lg min-w-0 border border-gray-100">\s*<CheckCircle2 className="w-3\.5 h-3\.5 text-blue-600 shrink-0 mt-0\.5" \/>\s*<span className="flex-1 min-w-0 break-words">\{f\}<\/span>\s*<\/li>\s*\)\)\}\s*<\/ul>/g,
      '<FeatureList features={printProduct.features} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-700" itemClassName="flex items-start gap-2 bg-gray-50 p-2 rounded-lg min-w-0 border border-gray-100" />'
    );
    fs.writeFileSync(file, code);
    console.log('Patched', file);
  }
}

replaceFeaturesRender('src/pages/HardwarePage.tsx');
replaceFeaturesRender('src/pages/SoftwarePage.tsx');

