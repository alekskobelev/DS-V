const fs = require('fs');
let code = fs.readFileSync('src/components/cms/RichTextEditor.tsx', 'utf8');

// Fix event.target.value
code = code.replace(
  /onInput=\{\(event\) => editor\.chain\(\)\.focus\(\)\.setColor\(event\.target\.value\)\.run\(\)\}/g,
  'onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}'
);

// Fix IndentExtension TS error by casting the returned commands to any or ignoring it
code = code.replace(
  /addCommands\(\) \{/g,
  'addCommands(): any {'
);

fs.writeFileSync('src/components/cms/RichTextEditor.tsx', code);
console.log('Fixed lint errors');
