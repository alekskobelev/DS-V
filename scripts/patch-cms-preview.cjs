const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

// Update state type
code = code.replace(
  /const \[pagePreviewViewport, setPagePreviewViewport\] = useState\<'desktop' \| 'tablet' \| 'mobile'\>\('desktop'\);/,
  "const [pagePreviewViewport, setPagePreviewViewport] = useState<'desktop' | 'mobile' | 'mobile-landscape'>('desktop');"
);

// Add to PageVisualPreview in 'split' mode
code = code.replace(
  /viewportMode=\{pagePreviewViewport\}\n *onViewportChange=\{setPagePreviewViewport\}/,
  "viewportMode={pagePreviewViewport}\n                onViewportChange={setPagePreviewViewport}\n                isFullScreen={false}\n                onToggleFullScreen={() => setPageViewMode('preview')}"
);

// Add to PageVisualPreview in 'preview' mode
code = code.replace(
  /viewportMode=\{pagePreviewViewport\}\n *onViewportChange=\{setPagePreviewViewport\}/,
  "viewportMode={pagePreviewViewport}\n                onViewportChange={setPagePreviewViewport}\n                isFullScreen={true}\n                onToggleFullScreen={() => setPageViewMode('split')}"
);

fs.writeFileSync('src/pages/CmsPage.tsx', code);
console.log('CmsPage patched');
