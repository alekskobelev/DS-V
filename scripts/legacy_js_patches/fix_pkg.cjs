const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts['db:push'] = 'drizzle-kit push --config=src/db/drizzle.config.ts';
pkg.scripts['db:generate'] = 'drizzle-kit generate --config=src/db/drizzle.config.ts';
pkg.scripts['db:studio'] = 'drizzle-kit studio --config=src/db/drizzle.config.ts';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
