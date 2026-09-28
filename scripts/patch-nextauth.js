const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', 'next-auth', 'utils', 'parse-url.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (!content.includes('// PATCHED FOR EMPTY URL')) {
    const safeCheck = `function parseUrl(url) {
  // PATCHED FOR EMPTY URL
  if (!url || typeof url !== 'string' || url.trim() === '') {
    const defaultUrl = new URL("http://localhost:3000/api/auth");
    const path = defaultUrl.pathname.replace(/\\/$/, "");
    const base = \`\${defaultUrl.origin}\${path}\`;
    return {
      origin: defaultUrl.origin,
      host: defaultUrl.host,
      path,
      base,
      toString: () => base
    };
  }`;
    content = content.replace('function parseUrl(url) {', safeCheck);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[patch-nextauth] Successfully patched next-auth/utils/parse-url.js');
  } else {
    console.log('[patch-nextauth] Already patched next-auth/utils/parse-url.js');
  }
}
