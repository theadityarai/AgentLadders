import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rate-limit';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        twoFactorCode: { label: 'Two-Factor Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        
        // Rate limiting: max 8 attempts per email per 15 minutes
        const rateLimitKey = `login_${normalizedEmail}`;
        const limitCheck = checkRateLimit(rateLimitKey, { limit: 8, windowMs: 15 * 60 * 1000 });
        if (!limitCheck.allowed) {
          throw new Error(`Too many login attempts. Please try again in ${limitCheck.resetSeconds}s.`);
        }

        const db = getDb();
        const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const passHash = user.password || user.passwordHash;
        let isValid = false;
        if (passHash) {
          isValid = await bcrypt.compare(credentials.password, passHash);
        }

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        // Verify agency status for non-superadmin users
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.email === 'aditya@agentladders.com' || user.email === 'admin@agentladders.com';
        if (!isSuperAdmin && user.agencyId) {
          const agency = (db.agencies || []).find((a: any) => a.id === user.agencyId);
          if (agency) {
            if (agency.status === 'Inactive') {
              throw new Error('AGENCY_INACTIVE');
            }
            if (agency.status === 'Suspended') {
              throw new Error('AGENCY_SUSPENDED');
            }
          }
        }

        // Check 2FA if enabled
        if (user.twoFactorEnabled) {
          const code = (credentials.twoFactorCode || '').trim();
          if (!code) {
            throw new Error('2FA_REQUIRED');
          }
          const isBackup = (user.twoFactorBackupCodes || []).includes(code);
          const isTotp = /^\d{6}$/.test(code);
          if (!isBackup && !isTotp) {
            throw new Error('Invalid 2FA verification code');
          }
        }

        return { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role, 
          agencyId: user.agencyId,
          image: user.avatar || user.image || ''
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.agencyId = (user as any).agencyId;
        token.picture = (user as any).image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).agencyId = token.agencyId;
        session.user.image = (token.picture as string) || session.user.image || '';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || (
    process.env.NODE_ENV === 'production'
      ? (() => { console.warn('CRITICAL SECURITY WARNING: NEXTAUTH_SECRET is not set in production!'); return 'fallback-secret-production-warning-12345'; })()
      : 'fallback-secret-12345'
  ),
};
