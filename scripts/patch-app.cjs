const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.includes('import { CrmPage }')) {
  code = code.replace("import { CmsPage } from './pages/CmsPage';", "import { CmsPage } from './pages/CmsPage';\nimport { CrmPage } from './pages/CrmPage';");
  fs.writeFileSync('src/App.tsx', code);
}
