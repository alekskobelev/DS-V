const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

if (!code.includes('useEffect(')) {
   // Wait, it DOES include useEffect( but not the import.
}
code = code.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");
fs.writeFileSync('src/pages/AccountPage.tsx', code);
