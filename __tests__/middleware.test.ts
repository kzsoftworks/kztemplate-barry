import { middleware } from '../middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';

jest.mock('@auth0/nextjs-auth0/edge', () => ({
  getSession: jest.fn()
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    nextUrl: new URL(url)
  })),
  NextResponse: {
    next: jest.fn(() => ({ headers: new Map() })),
    redirect: jest.fn((url) => ({
      url,
      status: 302,
      headers: new Map()
    }))
  }
}));

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create mock requests with different pathnames
  const createMockRequest = (pathname: string) => {
    const url = `https://example.com${pathname}`;
    return new NextRequest(url);
  };

  it('should allow access to public routes without checking session', async () => {
    // Test all public routes
    const publicRoutes = [
      '/',
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/callback',
      '/api/auth/signup',
      '/api/auth/error'
    ];

    for (const route of publicRoutes) {
      const req = createMockRequest(route);
      await middleware(req);

      // Verify that getSession was not called and the response is next()
      expect(getSession).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();

      // Reset mocks before next iteration
      jest.clearAllMocks();
    }
  });

  it('should allow access to API routes without checking session', async () => {
    const req = createMockRequest('/api/some-endpoint');
    await middleware(req);

    // Verify that getSession was not called and the response is next()
    expect(getSession).not.toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should redirect to login when no session exists for protected routes', async () => {
    const req = createMockRequest('/protected-route');

    // Mock getSession to return null (no session)
    (getSession as jest.Mock).mockResolvedValue(null);

    await middleware(req);

    // Verify redirect to login page
    expect(getSession).toHaveBeenCalled();
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.any(URL));
  });

  it('should allow access to protected routes when valid session exists', async () => {
    const req = createMockRequest('/protected-route');

    // Mock getSession to return a valid session
    (getSession as jest.Mock).mockResolvedValue({
      user: {
        sub: 'auth0|123456',
        email: 'test@example.com'
      }
    });

    await middleware(req);

    // Verify session check and allow access
    expect(getSession).toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('should redirect to login when session check throws an error', async () => {
    const req = createMockRequest('/protected-route');

    // Mock getSession to throw an error
    (getSession as jest.Mock).mockRejectedValue(
      new Error('Session verification failed')
    );

    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
  });
});
