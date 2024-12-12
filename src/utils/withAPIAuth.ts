import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from 'src/lib/auth0';

type Handler = (req: NextRequest) => Promise<NextResponse> | NextResponse;

export function withAPIAuth(handler: Handler) {
  return async function (request: NextRequest) {
    try {
      const response = NextResponse.next();

      const session = await authConfig.getSession(request, response);

      if (!session?.user) {
        return new NextResponse(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'User not authenticated'
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      const requestWithUser = new NextRequest(request, {
        headers: new Headers({
          ...Object.fromEntries(request.headers)
        })
      });

      return handler(requestWithUser);
    } catch (error) {
      console.error('Auth error:', error);
      return new NextResponse(
        JSON.stringify({
          error: 'Internal server error',
          message: 'Authorization failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}
