// Fix for NextAuth URL resolution during SSR / static prerender on Vercel
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  try {
    const pEnv = process.env;
    if (pEnv) {
      if (!pEnv['NEXTAUTH_URL'] || pEnv['NEXTAUTH_URL'].trim() === '') {
        const vercelUrl = pEnv['VERCEL_PROJECT_PRODUCTION_URL'] || pEnv['VERCEL_URL'];
        Object.assign(pEnv, {
          NEXTAUTH_URL: vercelUrl
            ? (vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`)
            : 'https://agentladders.com'
        });
      }
      if (!pEnv['NEXTAUTH_SECRET']) {
        Object.assign(pEnv, {
          NEXTAUTH_SECRET: 'super-secret-nextauth-key-12345'
        });
      }
    }
  } catch {
    // Ignore any environment mutation errors
  }
}
