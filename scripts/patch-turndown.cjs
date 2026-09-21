const fs = require('fs');
let code = fs.readFileSync('src/components/cms/RichTextEditor.tsx', 'utf8');

if (!code.includes('turndown-plugin-gfm')) {
  code = code.replace(
    /import TurndownService from 'turndown';/,
    "import TurndownService from 'turndown';\n// @ts-ignore\nimport { gfm } from 'turndown-plugin-gfm';"
  );
  
  code = code.replace(
    /const td = new TurndownService\(\{ headingStyle: 'atx', codeBlockStyle: 'fenced' \}\);/,
    "const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });\n      td.use(gfm);"
  );
  
  fs.writeFileSync('src/components/cms/RichTextEditor.tsx', code);
  console.log('Turndown GFM patched');
}
