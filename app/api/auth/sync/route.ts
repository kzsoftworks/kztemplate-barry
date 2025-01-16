import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { user, context } = body;

    const dbUser = await prisma.user.upsert({
      where: { auth0Id: user.sub },
      update: {
        email: user.email,
        name: user.name,
        picture: user.picture,
        roles: {
          connectOrCreate: context.authorization.roles.map(
            (roleName: string) => ({
              where: { name: roleName },
              create: { name: roleName }
            })
          )
        }
      },
      create: {
        auth0Id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
        roles: {
          connectOrCreate: context.authorization.roles.map(
            (roleName: string) => ({
              where: { name: roleName },
              create: { name: roleName }
            })
          )
        }
      },
      include: {
        roles: true
      }
    });

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync user'
      },
      { status: 500 }
    );
  }
}
