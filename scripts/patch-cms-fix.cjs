const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

const splitBlockStart = `          {/* Visual Live Preview in Split Mode */}
          {pageViewMode === 'split' && (
            <div className="xl:col-span-6 sticky top-6 h-[calc(100vh-140px)] min-h-[600px]">
              <PageVisualPreview`;

const splitBlockEnd = `              />
            </div>
          )}`;

const previewBlockStart = `          {/* Full-width Visual Live Preview Mode */}
          {pageViewMode === 'preview' && (
            <div className="w-full min-h-[750px] h-[calc(100vh-140px)]">
              <PageVisualPreview`;

const previewBlockEnd = `              />
            </div>
          )}`;

code = code.replace(
  /viewportMode=\{pagePreviewViewport\}\n *onViewportChange=\{setPagePreviewViewport\}\n *isFullScreen=\{true\}\n *onToggleFullScreen=\{[^}]+\}/g,
  "viewportMode={pagePreviewViewport}\n                onViewportChange={setPagePreviewViewport}"
);

code = code.replace(
  /viewportMode=\{pagePreviewViewport\}\n *onViewportChange=\{setPagePreviewViewport\}\n *isFullScreen=\{false\}\n *onToggleFullScreen=\{[^}]+\}/g,
  "viewportMode={pagePreviewViewport}\n                onViewportChange={setPagePreviewViewport}"
);

fs.writeFileSync('src/pages/CmsPage.tsx', code);
console.log('Reset props');
