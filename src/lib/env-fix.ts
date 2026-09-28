// Fix for NextAuth URL resolution during SSR / static prerender on Vercel
if (typeof process !== 'undefined' && process.env) {
  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.trim() === '') {
    const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    process.env.NEXTAUTH_URL = vercelUrl
      ? (vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`)
      : 'https://agentladders.com';
  }
  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = 'super-secret-nextauth-key-12345';
  }
}
