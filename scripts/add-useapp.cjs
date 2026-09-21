const fs = require('fs');
let code = fs.readFileSync('src/components/cms/CmsSeoTab.tsx', 'utf8');

code = code.replace(
  /import \{ runSeoAudit, PAGE_SEO_DATA, PRODUCT_SEO_DATA, SeoAuditReport \} from '\.\.\/\.\.\/utils\/seo';/,
  "import { runSeoAudit, PAGE_SEO_DATA, PRODUCT_SEO_DATA, SeoAuditReport } from '../../utils/seo';\nimport { useApp } from '../../context/AppContext';\nimport { Upload, Download } from 'lucide-react';"
);

// Add state to CmsSeoTab
const insertPos = code.indexOf('const refreshAudit = () => {');
const bulkCode = `
  const { customPages, updateCustomPage, products, updateProduct, services, updateService, articles, updateArticle, knowledgeBase, updateKnowledgeItem } = useApp();
  const [bulkImportText, setBulkImportText] = useState('');

  const generateBulkSeoJson = () => {
    const list: any[] = [];
    customPages.forEach(p => list.push({ entityType: 'page', id: p.id, url: '/' + p.slug, title: p.title, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', metaKeywords: p.metaKeywords || [] }));
    products.forEach(p => list.push({ entityType: 'product', id: p.id, url: '/hardware/' + p.id, title: p.name, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', metaKeywords: p.metaKeywords || (p.keywords || []) }));
    services.forEach(p => list.push({ entityType: 'service', id: p.id, url: '/services/' + p.id, title: p.title, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', metaKeywords: p.metaKeywords || (p.keywords || []) }));
    articles.forEach(p => list.push({ entityType: 'article', id: p.id, url: '/news/' + p.id, title: p.title, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', metaKeywords: p.metaKeywords || [] }));
    knowledgeBase.forEach(p => list.push({ entityType: 'knowledge', id: p.id, url: '/knowledge/' + p.id, title: p.title, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', metaKeywords: p.metaKeywords || [] }));
    
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`seo-metadata-export-\${new Date().toISOString().slice(0, 10)}.json\`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBulkImport = () => {
    try {
      const data = JSON.parse(bulkImportText);
      if (!Array.isArray(data)) throw new Error('Ожидается массив объектов');
      let count = 0;
      data.forEach(item => {
        const { entityType, id, metaTitle, metaDescription, metaKeywords } = item;
        const updates = { metaTitle, metaDescription, metaKeywords };
        if (entityType === 'page') updateCustomPage(id, updates);
        else if (entityType === 'product') updateProduct(id, updates);
        else if (entityType === 'service') updateService(id, updates);
        else if (entityType === 'article') updateArticle(id, updates);
        else if (entityType === 'knowledge') updateKnowledgeItem(id, updates);
        count++;
      });
      alert(\`Успешно обновлено \${count} записей!\`);
      setBulkImportText('');
    } catch (e: any) {
      alert('Ошибка импорта: ' + e.message);
    }
  };

`;

code = code.slice(0, insertPos) + bulkCode + code.slice(insertPos);

fs.writeFileSync('src/components/cms/CmsSeoTab.tsx', code);
console.log('Added useApp and handlers');
