import { prisma } from 'src/lib/prisma';
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(
  request: Request,
  { params }: { params: { auth0Id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse(null, { status: 401 });
    }

    // Only allow users to fetch their own data
    if (session.user.sub !== params.auth0Id) {
      return new NextResponse(null, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id: params.auth0Id },
    });

    if (!user) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse(null, { status: 500 });
  }
}
