import { authConfig } from '@/lib/auth0';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await authConfig.getSession();
    if (!session?.user) {
      return NextResponse.json('Unauthorized', { status: 401 });
    }

    // Get the latest user data from database
    const dbUser = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!dbUser) {
      return NextResponse.json('User not found', { status: 404 });
    }

    // Update the session with the latest dbUser data
    await authConfig.updateSession({
      ...session,
      user: { ...session.user, dbData: dbUser }
    });

    return NextResponse.json('Session refreshed', { status: 200 });
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
