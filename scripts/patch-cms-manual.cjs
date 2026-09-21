const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

if (!code.includes('CmsManualTab')) {
  // Import
  code = code.replace(
    "import { CmsSeoTab } from '../components/cms/CmsSeoTab';",
    "import { CmsSeoTab } from '../components/cms/CmsSeoTab';\nimport { CmsManualTab } from '../components/cms/CmsManualTab';"
  );
  
  // Tab type
  code = code.replace(
    "  const [activeTab, setActiveTab] = useState<",
    "  const [activeTab, setActiveTab] = useState<'manual' | "
  );

  // Tab Button
  const tabButtonHtml = `
            <button
              onClick={() => setActiveTab('manual')}
              className={\`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap \${
                activeTab === 'manual'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }\`}
            >
              <BookOpen className="w-4 h-4" />
              Инструкция
            </button>
            <button
              onClick={() => setActiveTab('backup')}
`;
  code = code.replace(
    /<\button>\s*<button\s*onClick=\{\(\) => setActiveTab\('backup'\)\}/,
    tabButtonHtml.trim()
  );

  // Tab Content
  const tabContentHtml = `
        {/* ================= TAB 7: SEO ================= */}
        {activeTab === 'seo' && (
          <CmsSeoTab initialData={seoData} onSave={handleSaveSeo} />
        )}

        {/* ================= TAB: MANUAL ================= */}
        {activeTab === 'manual' && (
          <CmsManualTab />
        )}
`;
  code = code.replace(
    /\{\/\* ================= TAB 7: SEO ================= \*\/\}\s*\{activeTab === 'seo' && \(\s*<CmsSeoTab initialData=\{seoData\} onSave=\{handleSaveSeo\} \/>\s*\)\}/,
    tabContentHtml.trim()
  );

  fs.writeFileSync('src/pages/CmsPage.tsx', code);
  console.log('Added Manual Tab');
}
