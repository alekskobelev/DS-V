const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const viteRegex = /\/\/ --- VITE MIDDLEWARE SETUP ---[\s\S]*?app\.get\('\*', \(_req, res\) => \{[\s\S]*?res\.sendFile\(path\.join\(distPath, 'index\.html'\)\);[\s\S]*?\}\);\s+\}/;

const match = code.match(viteRegex);
if (match) {
  const viteBlock = match[0];
  code = code.replace(viteBlock, '');
  
  // Find app.listen
  const listenIndex = code.indexOf('app.listen(');
  if (listenIndex > -1) {
    code = code.substring(0, listenIndex) + '\n' + viteBlock + '\n\n' + code.substring(listenIndex);
    fs.writeFileSync('server.ts', code);
    console.log('Fixed server.ts route order');
  } else {
    console.log('app.listen not found');
  }
} else {
  console.log('Vite block not found');
}
