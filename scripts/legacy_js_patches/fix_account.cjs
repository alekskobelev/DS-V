const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

if (code.includes('import React, { useState }') && !code.includes('useEffect')) {
  code = code.replace('import React, { useState }', 'import React, { useState, useEffect }');
} else if (code.includes('import { useState }') && !code.includes('useEffect')) {
  code = code.replace('import { useState }', 'import { useState, useEffect }');
}

fs.writeFileSync('src/pages/AccountPage.tsx', code);
