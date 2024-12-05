// lib/auth0.ts
import { initAuth0 } from '@auth0/nextjs-auth0';

export const authConfig = initAuth0({
  secret: process.env.AUTH0_SECRET!,
  baseURL: process.env.APP_BASE_URL!,
  clientID: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email'
  }
});
