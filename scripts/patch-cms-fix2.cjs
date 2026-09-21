const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

const splitStr = `pageViewMode === 'split' && (`;
const idx1 = code.indexOf(splitStr);
if (idx1 !== -1) {
  const vpStr = `viewportMode={pagePreviewViewport}`;
  const vpIdx1 = code.indexOf(vpStr, idx1);
  if (vpIdx1 !== -1) {
    code = code.substring(0, vpIdx1) + `viewportMode={pagePreviewViewport}
                onViewportChange={setPagePreviewViewport}
                isFullScreen={false}
                onToggleFullScreen={() => setPageViewMode('preview')}
` + code.substring(code.indexOf('/>', vpIdx1));
  }
}

const prevStr = `pageViewMode === 'preview' && (`;
const idx2 = code.indexOf(prevStr);
if (idx2 !== -1) {
  const vpStr = `viewportMode={pagePreviewViewport}`;
  const vpIdx2 = code.indexOf(vpStr, idx2);
  if (vpIdx2 !== -1) {
    code = code.substring(0, vpIdx2) + `viewportMode={pagePreviewViewport}
                onViewportChange={setPagePreviewViewport}
                isFullScreen={true}
                onToggleFullScreen={() => setPageViewMode('split')}
` + code.substring(code.indexOf('/>', vpIdx2));
  }
}

fs.writeFileSync('src/pages/CmsPage.tsx', code);
console.log('Fixed props');
