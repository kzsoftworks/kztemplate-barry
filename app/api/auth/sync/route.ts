// app/api/auth/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
export async function POST(request: NextRequest) {
  try {
    console.log('Sync endpoint called');

    const body = await request.json();
    console.log('Received payload:', body);

    const { user, context } = body;

    console.log('Processing user:', user.email);
    console.log('With roles:', context.authorization.roles);

    const dbUser = await prisma.user.upsert({
      where: { auth0Id: user.sub },
      update: {
        email: user.email,
        name: user.name,
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

    console.log('User created/updated:', dbUser);

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
