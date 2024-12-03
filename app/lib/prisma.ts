// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// PrismaClient es attachable a `global` en desarrollo para evitar
// múltiples instancias
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Función para sincronizar usuario de Auth0 con base de datos
export async function syncAuth0User(auth0User: {
  sub: string;
  email: string;
  name?: string;
  roles?: string[];
}) {
  try {
    // Buscar o crear usuario
    const user = await prisma.user.upsert({
      where: { auth0Id: auth0User.sub },
      update: {
        email: auth0User.email,
        name: auth0User.name
      },
      create: {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name
      }
    });

    // Sincronizar roles si se proporcionan
    if (auth0User.roles && auth0User.roles.length > 0) {
      // Crear o encontrar roles
      const roleRecords = await Promise.all(
        auth0User.roles.map((roleName) =>
          prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName }
          })
        )
      );

      // Actualizar roles del usuario
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
