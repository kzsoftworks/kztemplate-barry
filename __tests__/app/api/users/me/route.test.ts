// app/api/users/me/route.test.ts
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/users/me/route';
import { authConfig } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { AppRouteHandlerFnContext } from '@auth0/nextjs-auth0';

// Mock dependencies
jest.mock('@/lib/auth0', () => ({
  authConfig: {
    withApiAuthRequired: jest.fn((handler) => handler),
    getSession: jest.fn()
  }
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

// Mock Next.js objects
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    nextUrl: new URL(url)
  })),
  NextResponse: {
    next: jest.fn(() => ({ headers: new Map() })),
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      json: async () => body,
      headers: new Map()
    }))
  }
}));

describe('GET /api/users/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 when no user session is found', async () => {
    // Configure mocks
    (authConfig.getSession as jest.Mock).mockResolvedValue({});

    // Create request object
    const req = new NextRequest('https://example.com/api/users/me');
    const ctx: AppRouteHandlerFnContext = { params: {} };

    // Call the function
    const result = await GET(req, ctx);

    // Assertions
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'No user found' },
      { status: 404 }
    );
    expect(result.status).toBe(404);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return 404 when user session exists but not found in database', async () => {
    // Configure mocks
    (authConfig.getSession as jest.Mock).mockResolvedValue({
      user: { sub: 'auth0|123456' }
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    // Create request object
    const req = new NextRequest('https://example.com/api/users/me');
    const ctx: AppRouteHandlerFnContext = { params: {} };

    // Call the function
    const result = await GET(req, ctx);

    // Assertions
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { auth0Id: 'auth0|123456' },
      include: { roles: true }
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'No user found' },
      { status: 404 }
    );
    expect(result.status).toBe(404);
  });

  it('should return user data when user exists in database', async () => {
    // Mock user data
    const mockUser = {
      id: 1,
      auth0Id: 'auth0|123456',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/picture.jpg',
      roles: [{ id: 1, name: 'user' }]
    };

    // Configure mocks
    (authConfig.getSession as jest.Mock).mockResolvedValue({
      user: { sub: 'auth0|123456' }
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    // Create request object
    const req = new NextRequest('https://example.com/api/users/me');
    const ctx: AppRouteHandlerFnContext = { params: {} };

    // Call the function
    const result = await GET(req, ctx);

    // Assertions
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { auth0Id: 'auth0|123456' },
      include: { roles: true }
    });
    expect(NextResponse.json).toHaveBeenCalledWith(mockUser);
    const responseBody = await result.json();
    expect(responseBody).toEqual(mockUser);
  });

  it('should handle database errors properly', async () => {
    // Configure mocks
    (authConfig.getSession as jest.Mock).mockResolvedValue({
      user: { sub: 'auth0|123456' }
    });

    const dbError = new Error('Database error');
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(dbError);

    // Create request object
    const req = new NextRequest('https://example.com/api/users/me');
    const ctx: AppRouteHandlerFnContext = { params: {} };

    // Call the function
    const result = await GET(req, ctx);

    // Assertions
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
    expect(result.status).toBe(500);
  });
});
