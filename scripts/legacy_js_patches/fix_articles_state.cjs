const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const oldState = `  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('ds_cms_articles');
      return saved ? JSON.parse(saved) : NEWS_ARTICLES;
    } catch {
      return NEWS_ARTICLES;
    }
  });`;

const newState = `  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('ds_cms_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it's the old 3 articles, override with the new 12
        if (parsed.length < 12 && parsed.some((a: any) => a.id === 'news-topsolid-v718')) {
          return NEWS_ARTICLES;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return NEWS_ARTICLES;
  });`;

content = content.replace(oldState, newState);
fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Fixed articles state in AppContext');
