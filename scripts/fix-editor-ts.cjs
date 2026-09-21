const fs = require('fs');
let code = fs.readFileSync('src/components/cms/RichTextEditor.tsx', 'utf8');

code = code.replace(
  /editor\.commands\.setContent\(content, false\);/,
  'editor.commands.setContent(content, { emitUpdate: false });'
);

fs.writeFileSync('src/components/cms/RichTextEditor.tsx', code);
console.log('Fixed editor ts');
