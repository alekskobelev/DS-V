const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('import React')) {
    if (code.includes("import {") && code.includes("} from 'react'")) {
      // It has imports, maybe missing useMemo, useState etc
      const reactMatches = code.match(/import\s+\{([^}]+)\}\s+from\s+'react'/);
      if (reactMatches) {
        let imports = reactMatches[1].split(',').map(s => s.trim());
        const needed = ['useState', 'useEffect', 'useMemo', 'useRef', 'useCallback'];
        for (const n of needed) {
          if (!imports.includes(n) && code.includes(n)) {
            imports.push(n);
          }
        }
        code = code.replace(reactMatches[0], `import { ${imports.join(', ')} } from 'react'`);
      }
    } else {
      code = `import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';\n` + code;
    }
    fs.writeFileSync(file, code);
  } else {
      const reactMatches = code.match(/import\s+React.*?\{([^}]+)\}\s+from\s+'react'/);
      if (reactMatches) {
        let imports = reactMatches[1].split(',').map(s => s.trim());
        const needed = ['useState', 'useEffect', 'useMemo', 'useRef', 'useCallback'];
        let changed = false;
        for (const n of needed) {
          if (!imports.includes(n) && code.includes(n)) {
            imports.push(n);
            changed = true;
          }
        }
        if (changed) {
          code = code.replace(reactMatches[0], `import React, { ${imports.join(', ')} } from 'react'`);
          fs.writeFileSync(file, code);
        }
      } else {
        // Just add them if possible
        if (code.includes('import React from \'react\'')) {
           code = code.replace(/import React from 'react';?/, `import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';`);
           fs.writeFileSync(file, code);
        }
      }
  }
}

fixFile('src/pages/HardwarePage.tsx');
fixFile('src/pages/ServicesPage.tsx');
console.log('Fixed react imports');
