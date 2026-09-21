const fs = require('fs');
let code = fs.readFileSync('src/components/cms/RichTextEditor.tsx', 'utf8');

code = code.replace("import Table from '@tiptap/extension-table';", "import { Table } from '@tiptap/extension-table';");
code = code.replace("import TableRow from '@tiptap/extension-table-row';", "import { TableRow } from '@tiptap/extension-table-row';");
code = code.replace("import TableCell from '@tiptap/extension-table-cell';", "import { TableCell } from '@tiptap/extension-table-cell';");
code = code.replace("import TableHeader from '@tiptap/extension-table-header';", "import { TableHeader } from '@tiptap/extension-table-header';");

fs.writeFileSync('src/components/cms/RichTextEditor.tsx', code);
console.log('Fixed tiptap table imports');
