// Fix for NextAuth URL & Secret resolution on Vercel
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  try {
    const pEnv = process.env;
    if (pEnv) {
      if (!pEnv['NEXTAUTH_URL'] || pEnv['NEXTAUTH_URL'].trim() === '') {
        const vercelUrl = pEnv['VERCEL_PROJECT_PRODUCTION_URL'] || pEnv['VERCEL_URL'];
        Object.assign(pEnv, {
          NEXTAUTH_URL: vercelUrl
            ? (vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`)
            : 'https://agent-ladders.vercel.app'
        });
      }
      if (!pEnv['NEXTAUTH_SECRET'] || pEnv['NEXTAUTH_SECRET'].trim() === '') {
        Object.assign(pEnv, {
          NEXTAUTH_SECRET: 'agentladders-secret-production-key-998877665544332211'
        });
      }
    }
  } catch {
    // Ignore any environment mutation errors
  }
}
