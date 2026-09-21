const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// Extract Vite setup block
const viteStart = server.indexOf('// --- VITE MIDDLEWARE SETUP ---');
const listenStart = server.indexOf('app.listen(PORT, "0.0.0.0", () => {');

if (viteStart > -1 && listenStart > -1) {
  const partBeforeVite = server.substring(0, viteStart);
  const viteBlockAndRoutes = server.substring(viteStart, listenStart);
  const listenBlock = server.substring(listenStart);

  // Separate the vite block from the rest (the routes)
  const viteEndIndex = viteBlockAndRoutes.indexOf('  // === КАТАЛОГ ОБОРУДОВАНИЯ');
  
  if (viteEndIndex > -1) {
    const viteSetupCode = viteBlockAndRoutes.substring(0, viteEndIndex);
    const apiRoutesCode = viteBlockAndRoutes.substring(viteEndIndex);
    
    // Reorder: partBeforeVite + apiRoutesCode + viteSetupCode + listenBlock
    const newServer = partBeforeVite + apiRoutesCode + '\n' + viteSetupCode + '\n' + listenBlock;
    fs.writeFileSync('server.ts', newServer);
    console.log('Successfully reordered routes!');
  } else {
    // Maybe the routes are named differently, let's just find the end of the vite block.
    const viteEndRegex = /res\.sendFile\(path\.join\(distPath, 'index\.html'\)\);\s+\}\);\s+\}/;
    const match = viteBlockAndRoutes.match(viteEndRegex);
    if (match) {
      const splitIndex = match.index + match[0].length;
      const viteSetupCode = viteBlockAndRoutes.substring(0, splitIndex);
      const apiRoutesCode = viteBlockAndRoutes.substring(splitIndex);
      
      const newServer = partBeforeVite + apiRoutesCode + '\n' + viteSetupCode + '\n' + listenBlock;
      fs.writeFileSync('server.ts', newServer);
      console.log('Successfully reordered routes (fallback)!');
    }
  }
}
