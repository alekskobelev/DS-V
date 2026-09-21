import React, { useEffect, useRef, useState } from 'react';

interface ArticleContentRendererProps {
  content: string | string[];
  articleTitle?: string;
  className?: string;
}

export const ArticleContentRenderer: React.FC<ArticleContentRendererProps> = ({
  content,
  articleTitle = 'Статья',
  className = ''
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(450);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if content is plain paragraphs or rich HTML
  const isHtmlContent = typeof content === 'string' && (
    content.includes('<') && (
      content.includes('<div') || 
      content.includes('<p') || 
      content.includes('<style') || 
      content.includes('<script') || 
      content.includes('<table') || 
      content.includes('<section') ||
      content.includes('<h')
    )
  );

  // Auto-generate iframe HTML document with isolation and execution capability
  const getFullHtmlDoc = (htmlBody: string) => {
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${articleTitle.replace(/"/g, '&quot;')}</title>
  <style>
    /* Base typography and isolated article styling */
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 15px;
      line-height: 1.7;
      color: #1f2937;
      background-color: transparent;
      overflow-x: hidden;
    }
    body {
      padding: 4px 2px 24px 2px;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #111827;
      font-weight: 700;
      line-height: 1.35;
      margin-top: 1.6em;
      margin-bottom: 0.8em;
    }
    h1 { font-size: 1.75rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.4em; }
    h2 { font-size: 1.45rem; color: #1e3a8a; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
    h3 { font-size: 1.25rem; }
    h4 { font-size: 1.1rem; }
    p {
      margin-top: 0;
      margin-bottom: 1.2em;
    }
    a {
      color: #2563eb;
      text-decoration: underline;
      text-underline-offset: 2px;
      transition: color 0.15s ease;
    }
    a:hover {
      color: #1d4ed8;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      margin: 16px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 10px 14px;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #334155;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9em;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 16px;
      border-radius: 10px;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      line-height: 1.5;
      margin: 18px 0;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }
    blockquote {
      margin: 16px 0;
      padding: 12px 18px;
      border-left: 4px solid #3b82f6;
      background-color: #eff6ff;
      color: #1e3a8a;
      border-radius: 0 8px 8px 0;
      font-style: italic;
    }
    ul, ol {
      padding-left: 24px;
      margin-bottom: 1.2em;
    }
    li {
      margin-bottom: 0.4em;
    }
    button, input, select, textarea {
      font-family: inherit;
      font-size: inherit;
    }
  </style>
</head>
<body>
  <div id="article-root">
    ${htmlBody}
  </div>

  <script>
    (function() {
      // Notify parent of content height
      function sendHeight() {
        try {
          var root = document.getElementById('article-root') || document.body;
          var height = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            root.offsetHeight + 40
          );
          window.parent.postMessage({ type: 'ARTICLE_FRAME_RESIZE', height: height }, '*');
        } catch (e) {
          // ignore
        }
      }

      // Safe link handling: open all external links in new tab
      document.addEventListener('click', function(e) {
        var target = e.target;
        while (target && target.tagName !== 'A') {
          target = target.parentElement;
        }
        if (target && target.href) {
          target.target = '_blank';
          target.rel = 'noopener noreferrer';
        }
      }, true);

      // Height observation
      window.addEventListener('load', function() {
        sendHeight();
        setTimeout(sendHeight, 300);
        setTimeout(sendHeight, 1000);
      });

      if (window.ResizeObserver) {
        var ro = new ResizeObserver(function() {
          window.requestAnimationFrame(sendHeight);
        });
        ro.observe(document.body);
      }

      var mo = new MutationObserver(function() {
        sendHeight();
      });
      mo.observe(document.body, { childList: true, subtree: true, attributes: true });

      // Run on immediate execution
      sendHeight();
    })();
  </script>
</body>
</html>`;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ARTICLE_FRAME_RESIZE' && typeof event.data.height === 'number') {
        const h = Math.max(250, event.data.height);
        setIframeHeight(h);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleIframeLoad = () => {
    setIsLoaded(true);
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const doc = iframeRef.current.contentWindow.document;
        const height = Math.max(
          doc.body.scrollHeight,
          doc.documentElement.scrollHeight,
          doc.body.offsetHeight + 40
        );
        if (height > 100) {
          setIframeHeight(height);
        }
      }
    } catch {
      // ignore
    }
  };

  // If plain array of strings, render standard typography
  if (Array.isArray(content)) {
    return (
      <div className={`space-y-4 text-gray-800 leading-relaxed text-sm sm:text-base ${className}`}>
        {content.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    );
  }

  // If plain string without HTML tags, render formatted paragraphs
  if (!isHtmlContent) {
    return (
      <div className={`space-y-4 text-gray-800 leading-relaxed text-sm sm:text-base ${className}`}>
        {content.split('\n\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    );
  }

  // HTML content with isolated CSS and executable JavaScript
  return (
    <div className={`w-full relative min-w-0 ${className}`}>
      {!isLoaded && (
        <div className="w-full py-12 flex items-center justify-center text-gray-400 text-xs">
          <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
          <span>Загрузка интерактивных материалов статьи...</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        srcDoc={getFullHtmlDoc(content)}
        title={articleTitle}
        onLoad={handleIframeLoad}
        className={`w-full border-0 transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ height: `${iframeHeight}px`, overflow: 'hidden' }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
};
