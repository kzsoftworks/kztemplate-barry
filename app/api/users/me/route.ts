import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

export const GET = authConfig.withApiAuthRequired(
  async (request: NextRequest) => {
    try {
      const response = NextResponse.next();
      const session = await authConfig.getSession(request, response);

      if (!session?.user?.sub) {
        return NextResponse.json({ error: 'No user found' }, { status: 404 });
      }

      const user = await prisma.user.findUnique({
        where: {
          auth0Id: session.user.sub
        },
        include: {
          roles: true
        }
      });

      if (!user) {
        return NextResponse.json({ error: 'No user found' }, { status: 404 });
      }

      return NextResponse.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    }
  }
);
