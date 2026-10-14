const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', 'next-auth', 'utils', 'parse-url.js');

if (fs.existsSync(targetFile)) {
  const safeParseUrl = `"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseUrl;

function parseUrl(url) {
  const host = process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? ("https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL) : "") ||
    (process.env.VERCEL_URL ? ("https://" + process.env.VERCEL_URL) : "") ||
    "https://agent-ladders.vercel.app";

  let defaultUrl;
  try {
    defaultUrl = new URL(host.endsWith("/api/auth") ? host : (host.replace(/\\/$/, "") + "/api/auth"));
  } catch (e) {
    defaultUrl = new URL("https://agent-ladders.vercel.app/api/auth");
  }

  if (!url || typeof url !== 'string' || url.trim() === '') {
    const path = defaultUrl.pathname.replace(/\\/$/, "");
    const base = \`\${defaultUrl.origin}\${path}\`;
    return {
      origin: defaultUrl.origin,
      host: defaultUrl.host,
      path,
      base,
      toString: () => base
    };
  }

  let normalizedUrl = url;
  if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  let parsed;
  try {
    parsed = new URL(normalizedUrl);
  } catch (e) {
    parsed = defaultUrl;
  }

  const path = (parsed.pathname === "/" ? defaultUrl.pathname : parsed.pathname).replace(/\\/$/, "");
  const base = \`\${parsed.origin}\${path}\`;
  return {
    origin: parsed.origin,
    host: parsed.host,
    path,
    base,
    toString: () => base
  };
}
`;

  fs.writeFileSync(targetFile, safeParseUrl, 'utf8');
  console.log('[patch-nextauth] Successfully patched next-auth/utils/parse-url.js with dynamic Vercel host support');
}
