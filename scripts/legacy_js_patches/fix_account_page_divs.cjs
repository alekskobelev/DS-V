const fs = require('fs');

let content = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const buggyText = `            )}
          </div>
          </div>
        </div>
      </div>
    );
  }`;

const fixedText = `            )}
          </div>
        </div>
      </div>
    );
  }`;

content = content.replace(buggyText, fixedText);

fs.writeFileSync('src/pages/AccountPage.tsx', content);
console.log('Fixed AccountPage.tsx divs');
