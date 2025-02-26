// src/utils/__tests__/getServerAppUser.test.ts
import { authConfig } from '@/lib/auth0';
import { getServerAppUser } from '../../../src/utils/getServerAppUser';
import { Session } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('@/lib/auth0', () => ({
  authConfig: {
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

// Mock React cache
jest.mock('react', () => ({
  cache: (fn: any) => fn
}));

describe('getServerAppUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null user when no session exists', async () => {
    // Configure mock to return no session
    (authConfig.getSession as jest.Mock).mockResolvedValue(null);

    // Call the function
    const result = await getServerAppUser();

    // Assertions
    expect(result).toEqual({
      session: null,
      user: null,
      isLoading: false
    });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return user with DB data when session exists and user is in DB', async () => {
    // Mock session data
    const mockSession: Partial<Session> = {
      user: {
        sub: 'auth0|123456',
        email: 'test@example.com',
        name: 'Test User'
      }
    };

    // Mock DB user data
    const mockDbUser = {
      id: 1,
      auth0Id: 'auth0|123456',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/picture.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 1, name: 'user' }]
    };

    // Configure mocks
    (authConfig.getSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

    // Call the function
    const result = await getServerAppUser();

    // Assertions
    expect(result).toEqual({
      session: mockSession,
      user: {
        ...mockSession.user,
        dbData: mockDbUser
      },
      isLoading: false
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        auth0Id: mockSession.user?.sub
      },
      include: {
        roles: true
      }
    });
  });

  it('should return user without DB data when user not found in DB', async () => {
    // Mock session data
    const mockSession: Partial<Session> = {
      user: {
        sub: 'auth0|123456',
        email: 'test@example.com',
        name: 'Test User'
      }
    };

    // Configure mocks
    (authConfig.getSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    // Call the function
    const result = await getServerAppUser();

    // Assertions
    expect(result).toEqual({
      session: mockSession,
      user: {
        ...mockSession.user,
        dbData: undefined
      },
      isLoading: false
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        auth0Id: mockSession.user?.sub
      },
      include: {
        roles: true
      }
    });
  });

  it('should handle errors during fetching', async () => {
    // Configure mock to throw an error
    const error = new Error('Failed to get session');
    (authConfig.getSession as jest.Mock).mockRejectedValue(error);

    // Call the function
    const result = await getServerAppUser();

    // Assertions
    expect(result).toEqual({
      session: null,
      user: null,
      isLoading: false,
      error
    });

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should handle unknown errors during session fetch', async () => {
    // Mock unknown error
    const unknownError = { message: 'Unknown error' };
    (authConfig.getSession as jest.Mock).mockRejectedValue(unknownError);

    // Call the function
    const result = await getServerAppUser();

    // Assertions
    expect(result).toEqual({
      session: null,
      user: null,
      isLoading: false,
      error: new Error('Unknown error occurred')
    });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
