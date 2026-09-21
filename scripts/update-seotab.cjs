const fs = require('fs');
let code = fs.readFileSync('src/components/cms/CmsSeoTab.tsx', 'utf8');

if (!code.includes('SeoBulkItem')) {
  // Add imports from AppContext
  code = code.replace(
    /import \{ useApp \} from '\.\.\/\.\.\/context\/AppContext';/g,
    '' // remove if exists
  );
  
  // Actually we need to import useApp inside CmsSeoTab. Does it already import useApp?
  // Let's check:
}
