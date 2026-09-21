const fs = require('fs');
const file = 'src/context/AppContext.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const register = \(.*\) => \{[\s\S]*?setAuthUsers\(\(prev\) => \[\.\.\.prev, newAcc\]\);[\s\S]*?return true;\n  \};/,
  (match) => {
    return match.replace(
      "setAuthUsers((prev) => [...prev, newAcc]);",
      "apiService.saveUser(newAcc).then(() => setAuthUsers((prev) => [...prev, newAcc]));"
    );
  }
);

content = content.replace(
  /const updateAuthUser = \(.*\) => \{[\s\S]*?setAuthUsers\(nextUsers\);[\s\S]*?\};/,
  (match) => {
    return match.replace(
      "setAuthUsers(nextUsers);",
      "apiService.updateUser(id, updates).then(() => setAuthUsers(nextUsers));"
    );
  }
);

content = content.replace(
  /const updateAuthUserPermissions = \(.*\) => \{[\s\S]*?setAuthUsers\(nextUsers\);[\s\S]*?\};/,
  (match) => {
    return match.replace(
      "setAuthUsers(nextUsers);",
      "apiService.updateUserPermissions(id, permissions).then(() => setAuthUsers(nextUsers));"
    );
  }
);

content = content.replace(
  /const deleteAuthUser = \(.*\) => \{[\s\S]*?setAuthUsers\(\(prev\) => prev.filter\(\(u\) => u.id !== id\)\);[\s\S]*?\};/,
  (match) => {
    return match.replace(
      "setAuthUsers((prev) => prev.filter((u) => u.id !== id));",
      "apiService.deleteUser(id).then(() => setAuthUsers((prev) => prev.filter((u) => u.id !== id)));"
    );
  }
);

fs.writeFileSync(file, content);
