import { PrismaClient } from '@prisma/client';
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function syncAuth0User(auth0User: {
  sub: string;
  email: string;
  name?: string;
  roles?: string[];
  picture?: string;
}) {
  try {
    const user = await prisma.user.upsert({
      where: { auth0Id: auth0User.sub },
      update: {
        email: auth0User.email,
        name: auth0User.name
      },
      create: {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name,
        picture: auth0User.picture || '/placeholder-user.jpg',
        roles: {
          connectOrCreate: auth0User.roles?.map((roleName: string) => ({
            where: { name: roleName },
            create: { name: roleName }
          }))
        }
      }
    });

    if (auth0User.roles && auth0User.roles.length > 0) {
      const roleRecords = await Promise.all(
        auth0User.roles.map((roleName) =>
          prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName }
          })
        )
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          roles: {
            connect: roleRecords.map((role) => ({ id: role.id }))
          }
        }
      });
    }

    return user;
  } catch (error) {
    console.error('Error sincronizando usuario de Auth0:', error);
    throw error;
  }
}
