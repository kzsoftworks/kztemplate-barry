import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

export const GET = authConfig.withApiAuthRequired(async () => {
  try {
    const users = await prisma.user.findMany({
      include: { roles: true }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

export const POST = authConfig.withApiAuthRequired(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { email, name, roles, picture, auth0Id } = body;

      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          picture,
          auth0Id,
          roles: {
            connectOrCreate: roles.map((roleName: string) => ({
              where: { name: roleName },
              create: { name: roleName }
            }))
          }
        },
        include: {
          roles: true
        }
      });

      return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        {
          error: 'Failed to create user',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
);
