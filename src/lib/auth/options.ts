/**
 * NextAuth Configuration Options
 *
 * Configures the authentication providers and session strategy.
 * For this architecture, we use a simple credential provider or magic links
 * depending on the final DB schema, but we'll set up a dummy provider
 * to allow local development without third-party OAuth.
 */
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { config } from '@/lib/config';

const env = config();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Development Login',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'dev' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // In development, accept any login
        if (process.env.NODE_ENV !== 'production' || !env.AUTH_SECRET) {
          return { id: 'dev-user-1', name: 'Dev User', email: 'dev@wemotion.app' };
        }
        
        // In production, this would query the DB
        return null; 
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: env.AUTH_SESSION_TTL,
  },
  secret: env.AUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Expose the user ID to the client session
        (session.user as any).id = token.sub;
      }
      return session;
    }
  },
  pages: {
    // Custom sign-in page if needed later
    // signIn: '/auth/signin',
  }
};
