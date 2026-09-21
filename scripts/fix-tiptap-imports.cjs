const fs = require('fs');
let code = fs.readFileSync('src/components/cms/RichTextEditor.tsx', 'utf8');

code = code.replace("import TextStyle from '@tiptap/extension-text-style';", "import { TextStyle } from '@tiptap/extension-text-style';");

fs.writeFileSync('src/components/cms/RichTextEditor.tsx', code);
console.log('Fixed tiptap imports');
