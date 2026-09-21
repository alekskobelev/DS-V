const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

if (!code.includes('import { RichTextEditor }')) {
  code = code.replace(
    "import { ArticleCodeEditor } from '../components/cms/ArticleCodeEditor';",
    "import { ArticleCodeEditor } from '../components/cms/ArticleCodeEditor';\nimport { RichTextEditor } from '../components/cms/RichTextEditor';\nimport { ImageUploadInput } from '../components/common/ImageUploadInput';"
  );
  fs.writeFileSync('src/pages/CmsPage.tsx', code);
  console.log('Added RichTextEditor and ImageUploadInput imports to CmsPage');
}
