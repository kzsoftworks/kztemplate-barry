import { initAuth0 } from '@auth0/nextjs-auth0';

export const authConfig = initAuth0({
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  baseURL: process.env.APP_BASE_URL,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  secret: process.env.AUTH0_SECRET,
  idpLogout: true
});
