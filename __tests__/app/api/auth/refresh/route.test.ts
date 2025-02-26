import { authConfig } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { POST } from '@/app/api/auth/refresh/route';

// Mock Next.js objects
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    nextUrl: new URL(url)
  })),
  NextResponse: {
    next: jest.fn(() => ({ headers: new Map() })),
    json: jest.fn((body, init) => {
      const response = {
        status: init?.status || 200,
        json: async () => body,
        headers: new Map()
      };
      // Simular que la respuesta es el mismo objeto body
      Object.assign(response, body);
      return response;
    })
  }
}));

// Mock dependencies
jest.mock('@/lib/auth0', () => ({
  authConfig: {
    getSession: jest.fn(),
    updateSession: jest.fn()
  }
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

describe('Auth Refresh Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 with Unauthorized response body when no user session exists', async () => {
    // Configure mock to return no session
    (authConfig.getSession as jest.Mock).mockResolvedValue(null);

    // Call the POST handler
    const result = await POST();

    // Assertions
    expect(result.status).toBe(401);
    expect(await result.json()).toBe('Unauthorized');
  });

  it('should refresh session with latest user data from database', async () => {
    // Mock session data
    const mockSession = {
      user: {
        email: 'test@example.com',
        sub: 'auth0|123456'
      }
    };

    // Mock database user data
    const mockDbUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/picture.jpg',
      roles: [{ id: 1, name: 'user' }]
    };

    // Configure mocks
    (authConfig.getSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
    (authConfig.updateSession as jest.Mock).mockResolvedValue({
      ...mockSession,
      user: {
        ...mockSession.user,
        dbData: mockDbUser
      }
    });

    // Call the POST handler
    const result = await POST();

    // Assertions
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockSession.user.email }
    });

    expect(authConfig.updateSession).toHaveBeenCalledWith({
      ...mockSession,
      user: {
        ...mockSession.user,
        dbData: mockDbUser
      }
    });

    const responseBody = await result.json();
    expect(responseBody).toBe('Session refreshed');
  });

  it('should return 404 when user not found in database', async () => {
    // Mock session data
    const mockSession = {
      user: {
        email: 'test@example.com',
        sub: 'auth0|123456'
      }
    };

    // Configure mocks
    (authConfig.getSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    // Call the POST handler
    const result = await POST();

    // Assertions
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockSession.user.email }
    });

    const responseBody = await result.json();
    expect(responseBody).toBe('User not found');
  });

  it('should handle database errors during refresh', async () => {
    // Mock session data
    const mockSession = {
      user: {
        email: 'test@example.com',
        sub: 'auth0|123456'
      }
    };

    // Configure mocks
    (authConfig.getSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    // Call the POST handler
    const result = await POST();

    // Assertions
    const responseBody = await result.json();
    expect(responseBody).toEqual('Internal Server Error');
  });
});
