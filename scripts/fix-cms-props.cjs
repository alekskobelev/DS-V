const fs = require('fs');
let code = fs.readFileSync('src/components/cms/RichTextEditor.tsx', 'utf8');

code = code.replace(
  /interface RichTextEditorProps \{/,
  'interface RichTextEditorProps {\n  placeholder?: string;'
);

fs.writeFileSync('src/components/cms/RichTextEditor.tsx', code);
console.log('Fixed RichTextEditorProps');
