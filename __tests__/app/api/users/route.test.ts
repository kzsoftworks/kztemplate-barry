// app/api/users/route.test.ts
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/users/route';
import { prisma } from '@/lib/prisma';
import { AppRouteHandlerFnContext } from '@auth0/nextjs-auth0';

// Mock dependencies
jest.mock('@/lib/auth0', () => ({
  authConfig: {
    withApiAuthRequired: jest.fn((handler) => handler)
  }
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      create: jest.fn()
    }
  }
}));

// Mock Next.js objects
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    json: jest.fn()
  })),
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      json: async () => body,
      headers: new Map()
    }))
  }
}));

describe('Users API Route', () => {
  const mockContext: AppRouteHandlerFnContext = { params: {} };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return list of users with their roles', async () => {
      // Mock users data
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          name: 'User One',
          roles: [{ id: 1, name: 'user' }]
        },
        {
          id: 2,
          email: 'user2@example.com',
          name: 'User Two',
          roles: [{ id: 2, name: 'admin' }]
        }
      ];

      // Configure mock
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      // Create mock request
      const req = new NextRequest('https://example.com/api/users');

      // Call the GET handler
      const result = await GET(req, mockContext);

      // Assertions
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        include: { roles: true }
      });
      expect(NextResponse.json).toHaveBeenCalledWith(mockUsers);
      const responseBody = await result.json();
      expect(responseBody).toEqual(mockUsers);
    });

    it('should handle database errors when fetching users', async () => {
      // Mock database error
      const unknownError = { message: 'Unknown error' };
      (prisma.user.findMany as jest.Mock).mockRejectedValue(unknownError);

      // Create mock request
      const req = new NextRequest('https://example.com/api/users');

      // Call the GET handler
      const result = await GET(req, mockContext);

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Failed to fetch users',
          details: 'Unknown error'
        },
        { status: 500 }
      );
      const responseBody = await result.json();
      expect(responseBody.error).toBe('Failed to fetch users');
      expect(responseBody.details).toBe('Unknown error');
      expect(result.status).toBe(500);
    });

    it('should handle Error instance in database errors', async () => {
      // Mock database error
      const dbError = new Error('Database connection failed');
      (prisma.user.findMany as jest.Mock).mockRejectedValue(dbError);

      // Create mock request
      const req = new NextRequest('https://example.com/api/users');

      // Call the GET handler
      const result = await GET(req, mockContext);

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Failed to fetch users',
          details: 'Database connection failed'
        },
        { status: 500 }
      );
      const responseBody = await result.json();
      expect(responseBody.error).toBe('Failed to fetch users');
      expect(responseBody.details).toBe('Database connection failed');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user with roles', async () => {
      // Mock user creation data
      const newUserData = {
        email: 'newuser@example.com',
        name: 'New User',
        roles: ['user'],
        picture: 'https://example.com/picture.jpg',
        auth0Id: 'auth0|newuser123'
      };

      // Mock created user
      const createdUser = {
        ...newUserData,
        id: 3,
        roles: [{ id: 1, name: 'user' }]
      };

      // Configure mock request
      const req = new NextRequest('https://example.com/api/users');
      (req.json as jest.Mock).mockResolvedValue(newUserData);

      // Configure mock Prisma
      (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

      // Call the POST handler
      const result = await POST(req, mockContext);

      // Assertions
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: newUserData.email,
          name: newUserData.name,
          picture: newUserData.picture,
          auth0Id: newUserData.auth0Id,
          roles: {
            connectOrCreate: newUserData.roles.map((roleName) => ({
              where: { name: roleName },
              create: { name: roleName }
            }))
          }
        },
        include: {
          roles: true
        }
      });
      expect(NextResponse.json).toHaveBeenCalledWith(createdUser, {
        status: 201
      });
      const responseBody = await result.json();
      expect(responseBody).toEqual(createdUser);
      expect(result.status).toBe(201);
    });

    it('should handle errors when creating a user', async () => {
      // Mock user creation data
      const newUserData = {
        email: 'newuser@example.com',
        name: 'New User',
        roles: ['user']
      };

      // Configure mock request
      const req = new NextRequest('https://example.com/api/users');
      (req.json as jest.Mock).mockResolvedValue(newUserData);

      // Configure mock Prisma to throw an error
      (prisma.user.create as jest.Mock).mockRejectedValue(
        new Error('Creation failed')
      );

      // Call the POST handler
      const result = await POST(req, mockContext);

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Failed to create user',
          details: 'Creation failed'
        },
        { status: 500 }
      );
      const responseBody = await result.json();
      expect(responseBody.error).toBe('Failed to create user');
      expect(responseBody.details).toBe('Creation failed');
    });

    it('should handle non-Error object during user creation', async () => {
      // Mock user creation data
      const newUserData = {
        email: 'newuser@example.com',
        name: 'New User',
        roles: ['user']
      };

      // Configure mock request
      const req = new NextRequest('https://example.com/api/users');
      (req.json as jest.Mock).mockResolvedValue(newUserData);

      // Configure mock Prisma to throw a non-Error object
      const nonErrorObject = { message: 'Database error' };
      (prisma.user.create as jest.Mock).mockRejectedValue(nonErrorObject);

      // Call the POST handler
      const result = await POST(req, mockContext);

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Failed to create user',
          details: 'Unknown error'
        },
        { status: 500 }
      );
      const responseBody = await result.json();
      expect(responseBody.error).toBe('Failed to create user');
      expect(responseBody.details).toBe('Unknown error');
    });
  });
});
