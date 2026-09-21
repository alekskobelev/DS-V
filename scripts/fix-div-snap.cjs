const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/pages', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We can't safely regex all <div className="..."> to be snap-section, 
    // but we can at least ensure we don't have massive empty spaces.
    content = content.replace(/min-h-screen/g, 'min-h-[calc(100vh-80px)]');

    if (content !== original) {
      fs.writeFileSync(filePath, content);
    }
  }
});
console.log('Fixed min-h-screen in div blocks');
