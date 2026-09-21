const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const oldCode = `      if (Array.isArray(sArts) && sArts.length > 0) setArticles(sArts);`;
const newCode = `      if (Array.isArray(sArts) && sArts.length > 0) {
        if (sArts.length < 12 && sArts.some((a: any) => a.id === 'news-topsolid-v718')) {
          setArticles(NEWS_ARTICLES);
        } else {
          setArticles(sArts);
        }
      }`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Fixed sArts check in AppContext');
