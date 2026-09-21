const fs = require('fs');

let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace raw fetches with apiService calls
content = content.replace(
  /fetch\('\/api\/users', \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(newAcc\),\s*\}\)\.catch\(\(err\) => \{\s*console\.error\('Failed to create user in DB:', err\);\s*\}\);/g,
  `apiService.saveUser(newAcc).catch((err) => {
      console.error('Failed to create user in DB:', err);
    });`
);

content = content.replace(
  /fetch\(\`\/api\/users\/\$\{id\}\`, \{\s*method: 'PUT',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(updatedAcc\),\s*\}\)\.catch\(\(err\) => \{\s*console\.error\('Failed to update user in DB:', err\);\s*\}\);/g,
  `apiService.updateUser(id, updatedAcc!).catch((err) => {
      console.error('Failed to update user in DB:', err);
    });`
);

content = content.replace(
  /fetch\(\`\/api\/users\/\$\{id\}\/permissions\`, \{\s*method: 'PUT',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{ permissions: newPerms \}\),\s*\}\)\.catch\(\(err\) => \{\s*console\.error\('Failed to update user permissions in DB:', err\);\s*\}\);/g,
  `apiService.updateUserPermissions(id, newPerms).catch((err) => {
      console.error('Failed to update user permissions in DB:', err);
    });`
);

content = content.replace(
  /fetch\(\`\/api\/users\/\$\{id\}\`, \{ method: 'DELETE' \}\).catch\(\(err\) => \{\s*console\.error\('Failed to delete user in DB:', err\);\s*\}\);/g,
  `apiService.deleteUser(id).catch((err) => {
      console.error('Failed to delete user in DB:', err);
    });`
);

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Patched AppContext fetches');
