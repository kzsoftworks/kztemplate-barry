import { UserProfile } from '@auth0/nextjs-auth0/client';
import { User } from '@prisma/client';

declare module '@auth0/nextjs-auth0/client' {
  interface UserProfile {
    dbData?: User;
  }
}
